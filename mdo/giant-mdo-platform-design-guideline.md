# 巨大機械 Middle Platform 設計指南

> 版本：2026-07-08  
> 範圍：巨大機械 Middle Platform / Mid Office 設計準則

---

## 1. 定位

Middle Platform 是巨大機械的語意控制層與業務能力平台。它不是另一個前台 App，也不是 SAP / ERP 的替代品，而是介於 Front Office 與 Back Office 之間的共享層：

```text
Front Office
  B2C, Dealer Portal, RideLife, RideControl, Service Platform, internal tools
        |
        | Read APIs / Action commands / domain events
        v
Middle Platform
  Object Types, Link Types, Functions, Actions, Integrations,
  Auth, Access Policies, Integration Events, Semantic Model, AI Context
        |
        | Async sync / connector / adapter / mapping
        v
Back Office / External Systems
  SAP, Oracle, MES, WMS, data lake, partner systems
```

核心目的只有一個：讓所有前台與內部應用使用同一份企業資料定義、同一套業務邏輯、同一個可治理的整合通道。

**設計鐵律：資料定義一次，邏輯撰寫一次，存取用設定管理，不在各 App 重複實作。**

---

## 2. 核心設計原則

1. **Shared capability belongs in the Middle Platform.** 只要兩個以上 App 會使用同一個資料、規則或流程，就應被設計成平台能力，而不是 app-local model。
2. **Front Office never owns shared business truth.** 前台只能透過 API 讀取，透過 Action / command 寫入，不直接連資料庫，不直接寫 SAP。
3. **Object Type is semantic, not table.** Object Type 代表具備身份、生命週期、可被連結與重用的業務物件，不等於每一張 DB table。
4. **Read = query, write = Action.** 查詢可以是 read API；任何新增、修改、刪除、審核、同步都必須走 Action。
5. **Function is pure.** Function 只能驗證、計算、轉換、聚合、推薦或查詢，不寫資料。
6. **Action is auditable and compensatable.** Action 必須有 precondition、audit log、補償語意；需要外部同步時要產生可靠的同步事件。
7. **Semantic links are first-class.** 關係不是只有 FK；Link Type 必須有語意名稱、cardinality、reverseName，支援 UI 導航、查詢、AI context。
8. **Tenant scope is explicit.** 企業層 tenant key 是 `enterpriseId`；GSC / sales company 是業務範圍，不可當作唯一 tenant boundary。
9. **ERP sync is asynchronous.** User-facing write 不等待 SAP；平台先完成業務寫入，再由整合機制同步。
10. **Contracts protect consumers.** API / schema / metadata 改動必須採 backward-compatible 流程，並通過契約與相容性檢查。

---

## 3. Middle Platform 與 Giant PBC 的對應

巨大 Middle Platform 使用 PBC（Packaged Business Capability）作為中台能力單位，並使用 Object / Function / Action / Integration 作為設計抽象。兩者對應如下：

| Giant PBC 組成 | Middle Platform 設計抽象 | 設計要求 |
|---|---|---|
| Data Model | Object Types + Link Types | 定義 canonical business object 與語意關係 |
| Read APIs | Resource queries / Functions | 讀取、計算、解析，不改狀態 |
| Write APIs / Commands | Actions | precondition、audit、compensation、idempotency、integration event |
| Integration | Integration Bus + Mapping Rules | SAP / MES / WMS 接入、重試、異常佇列、同步狀態 |
| Governance | Contracts + Access Policies + Semantic Model | API 版本、consumer declarations、RBAC、ontology |

因此，巨大機械的 PBC 不應只是微服務或資料表集合，而應是一個可重用的業務能力包：資料、關係、查詢、命令、整合、治理一起設計。

---

## 4. Middle Platform 四大抽象

### 4.1 Object Type：什麼東西存在

建立 Object Type 的判斷標準是 identity / lifecycle / reuse，而不是資料庫長相。

應建立 Object Type 的情況：

- 有自己的 ID，其他物件會指向它，例如 `Consumer`, `Organization`, `Item`, `ServiceTicket`。
- 有自己的生命週期與狀態機，例如 ticket opened → assigned → resolved → closed。
- 一個 parent 會有多筆，例如 BOM entries、item attributes、work orders。
- 具有自己的規則、權限或 Actions，例如 warranty claim、payment、booking。
- 會被多個 App 或 PBC 重用，例如 Product Master、Dealer / Store、Service BOM。

不應建立 Object Type 的情況：

- 只是 scalar 欄位，例如 color、size、description。
- 是計算結果，應放在 Function。
- 是流程操作，應放在 Action。
- 是既有 canonical object 的變體，應用欄位、link、extension 或 status 表達。
- 是 1:1 且總是一起讀寫的資料，除非有不同來源、權限、更新頻率或極寬冷資料理由。

Object Type 欄位規範：

- 名稱使用 PascalCase 單數，例如 `ProductModel`, `ServiceTicket`, `ExchangeRate`。
- 欄位使用支援型別：`text`, `textarea`, `number`, `date`, `datetime`, `boolean`, `select`, `json`。
- `select` 必須列出 options。
- Tenant-scoped business records 必須有 `enterpriseId`，需要業務區域時再加 `gsc` / `salesCompanyId` / `organizationId`。
- ERP synced records 必須有 `erpStatus`, `erpReferenceNumber`, `erpSyncAt`，建議加 `erpLastError`。
- 業務資料預設 soft delete，不做一般使用者可觸發的 physical delete。

### 4.1.1 Data Object 拆分決策流程

設計 data object 時，先不要問「要幾張 table」，要先問「業務世界裡有幾個會獨立存在、獨立變動、被別人引用的東西」。Middle Platform 的 Object Type 是語意物件；資料庫 table 是後續實作。

建議使用這個決策流程：

```text
新資料需求
  |
  v
這是既有 canonical object 嗎？
  |-- 是：擴充欄位 / link / extension，不新增重複 object
  |
  v
它有自己的身份、生命週期、狀態或 Action 嗎？
  |-- 是：建立 Object Type
  |
  v
它會被多個 parent 或多個 app 引用嗎？
  |-- 是：建立 Object Type
  |
  v
它是 parent 底下的多筆明細、規則、條件或歷史嗎？
  |-- 是：拆成 child Object Type，用 Link 連回 parent
  |
  v
它只是固定、1:1、總是跟 parent 一起讀寫的屬性嗎？
  |-- 是：做成 field
```

判斷表：

| 問題 | 如果答案是 YES | 設計方式 |
|---|---|---|
| 其他資料會指向它嗎？ | 例如 dealer、item、serial number | Object Type |
| 它有自己的建立、發布、停用、審核流程嗎？ | 例如 warranty claim、BOM version | Object Type |
| 一個 parent 會有多筆嗎？ | BOM lines、payments、documents | Child Object Type + Link |
| 它會被兩個以上 App 使用嗎？ | product, consumer, currency | Canonical Object Type |
| 它會依 GSC / plant / store 有不同值嗎？ | item plant data、price、stock | Context-specific Object Type |
| 它只是固定欄位且總是跟 parent 一起讀嗎？ | name、description、status | Field |
| 它是計算或判斷結果嗎？ | SLA、warranty eligibility | Function output，不是 Object |
| 它是操作流程嗎？ | approve、cancel、sync | Action，不是 Object |

### 4.1.2 拆分粒度規則

Object 拆太粗會變成無法治理的 mega object；拆太細會造成 link / join 過多。Middle Platform 的標準是「用生命週期與多重性拆，不用工程潔癖拆」。

**應該放在同一個 Object 的情況：**

- 1:1，且總是一起建立、一起讀取、一起更新。
- 同一個 owner / source system。
- 同一個權限模型。
- 同一個生命週期。
- 欄位穩定、可預期，例如 `Item.code`, `Item.name`, `Item.baseUom`, `Item.status`。

**應該拆成不同 Object 的情況：**

- 1:N 或 N:N，例如 `ProductModel has Sku`, `ServiceBomVersion has ServiceBomEntry`。
- 有自己的狀態或版本，例如 `ServiceBomVersion`, `WarrantyClaim`, `Payment`。
- 來源不同，例如 ERP product master、GSC local overlay、MES serial trace。
- 權限不同，例如 cost data 只給 costing team，product basic data 給 service / dealer。
- 更新頻率不同，例如 Item master 很少改，但 stock / price / FX rate 常改。
- 需要獨立 audit 或 rollback，例如 ActionOrder、payment refund、claim approval。
- 開放式屬性集合，例如 MDM item attributes、configurable product attributes。

**避免的兩個極端：**

- 不要把所有東西塞進 `data: json`，否則無法查詢、無法驗證、無法治理。
- 不要把每個普通欄位都變 Object，否則讀取一個 item 需要走一串沒有語意價值的 links。

### 4.1.3 Master / Transaction / Configuration / Event 的拆分

每個 data object 應先分類，分類會決定 owner、生命週期、同步方式與資料庫 group。

| 類型 | 定義 | 範例 | 設計重點 |
|---|---|---|---|
| Master Data | 長期存在，被多流程引用 | `Organization`, `Consumer`, `Item`, `ProductModel`, `Currency` | canonical、去重、跨 app 共用 |
| Transaction Data | 一次業務事件或流程結果 | `ServiceTicket`, `Booking`, `Payment`, `SalesOrder`, `WarrantyClaim` | Action-driven、audit、狀態機 |
| Configuration Data | 規則、選項、mapping、policy | `WarrantyPolicy`, `ExchangeRateRule`, `MappingRule`, `AccessPolicy` | versioned、可生效 / 失效 |
| Relationship Data | 關係本身有屬性或生命週期 | `ServiceBomEntry`, `AlternativePartRule`, `OrgSiteRelation` | 不只 Link，需建 Object |
| Event / Log Data | 發生過的不可變紀錄 | action history、sync events、integration messages | append-only、可追溯 |
| Projection / Read Model | 為查詢效率建立的衍生資料 | stock snapshot、resolved BOM view | 不擁有真相，可重建 |

如果關係本身有欄位，例如 BOM line 有 quantity、position、applicability、effective date，它不是單純 Link，應建立 relationship object，例如 `ServiceBomEntry`。

### 4.1.4 巨大機械常見 Data Object 拆分範例

#### Product / Item / SKU

建議拆分：

```text
ProductModel
  has many Sku
  has many ServiceBomVersion

Sku
  belongsTo ProductModel
  has market / color / size / sellable attributes

Item
  canonical material / part identity
  has many ItemAttribute
  has many ItemContext

ItemAttribute
  variable attributes by item type

ItemContext
  plant / gsc / sales-company specific values
```

規則：

- `ProductModel` 是 model-year / market-facing product concept。
- `Sku` 是可銷售或可識別的 product code。
- `Item` 是料件 / 零件 / 物料 canonical identity。
- plant-specific、GSC-specific、sales-specific 欄位不要硬塞進 `Item`；拆成 `ItemContext` 或明確 context object。
- variable attributes 不要全部變固定欄位，也不要全部塞 JSON；用 `ItemAttribute` / attribute definition。

#### Service BOM

建議拆分：

```text
ServiceBomVersion
  status: RAW / DRAFT / PUBLISHED / RETIRED
  belongsTo ProductModel

ServiceBomEntry
  belongsTo ServiceBomVersion
  references Item
  has quantity, position, serviceability, condition

AlternativePartRule
  scoped by model / bom entry / gsc / product code
  canReplace Item

ServiceBomOverlay
  scoped by gsc
  overrides global published BOM
```

規則：

- BOM header / version 與 BOM line 要拆開，因為 line 是 1:N 且有自己的欄位。
- 替代料不是 item 上的一個簡單 array；通常有 scope、條件與有效期，應做成 rule object。
- GSC local BOM 不要 fork global BOM；使用 overlay。

#### Organization / Dealer / Store

建議拆分：

```text
Organization
  type: ENTERPRISE / SALES_COMPANY / MANUFACTURING_COMPANY / DISTRIBUTOR / DEALER
  parent -> Organization

Location
  type: STORE / WAREHOUSE / FACTORY / OFFICE
  operatedByOrganization -> Organization

PartnerUser
  worksFor -> Organization
  assignedTo -> Location
```

規則：

- 不要為每一層都建立 `SalesCompany`, `Dealer`, `StoreCompany` 等重複 master；優先用 `Organization.type` 表達組織節點。
- 實體地點用 `Location`，不要混在 `Organization`。
- `enterpriseId` 是 tenant boundary；`Organization` hierarchy 是業務結構。

#### Payment / Document / Attachment

建議拆分：

```text
Payment
  paidBy -> Consumer / Organization
  forTicket -> ServiceTicket
  forOrder -> SalesOrder
  status, amount, currency, method

Document
  uploadedBy -> User / PartnerUser
  relatedTo -> business object
  type, url, checksum, retention policy
```

規則：

- Payment 有狀態、金流 reference、退款與 reconciliation，因此是 Object，不是某張 ticket 的欄位。
- Document / Attachment 若會被多模組引用、需要權限與保留政策，應是 Object。

### 4.1.5 Context Object 與 Overlay

巨大機械常見跨地區 / 跨公司差異，不應用複製 master data 解決，而應使用 context object 或 overlay。

適合 context object 的情況：

- 同一 Item 在不同 plant 有不同 procurement type、lead time、valuation。
- 同一 SKU 在不同 GSC 有不同上市狀態、價格、可售性。
- 同一 BOM 在某 GSC 有 local substitution 或禁用條件。
- 同一 dealer 在不同 market 有不同 tier 或 credit policy。

設計方式：

```text
Canonical Object
  stable identity and global fields

Context Object
  canonicalObjectId
  enterpriseId
  gsc / plant / organizationId / channel
  context-specific fields
  effectiveFrom / effectiveTo
```

避免：

- 複製一份 `Item_GSC_TW`, `Item_GSC_JP`。
- 在 canonical object 上加大量 `twPrice`, `jpPrice`, `euPrice` 欄位。
- 讓前台自己決定套用哪個 context；應由 Function / resolver 決定。

### 4.1.6 Object 設計輸出模板

每個新 Object Type PR 或設計文件至少要填：

```text
Object Type:
  name:
  category: Master / Transaction / Configuration / Relationship / Event / Projection
  owner PBC / module:
  source of truth:
  consumers:
  tenant scope:
    enterpriseId required: yes/no
    gsc / organization scope:
  lifecycle:
    statuses:
    create/update/retire Actions:
  fields:
    - name / type / required / options / default / index reason
  links:
    - name / targetObjectType / cardinality / reverseName / meaning
  functions:
    - validations / calculations / resolvers
  actions:
    - command name / preconditions / compensation / audit / integration event
  integrations:
    - external systems / direction / mapping / sync metadata
  storage:
    database group:
    storage ownership and database group:
  contract:
    API endpoints:
    consumer declarations:
  migration:
    additive or expand-contract plan:
```

### 4.2 Link Type：東西如何關聯

Link Type 是語意關係，不只是資料庫 FK。每個 link 必須定義：

- `name`：語意動詞，例如 `has`, `belongsTo`, `assignedTo`, `coveredBy`, `canReplace`。
- `targetObjectType`：目標物件。
- `cardinality`：`one-to-one`, `one-to-many`, `many-to-one`, `many-to-many`。
- `reverseName`：反向語意，例如 `assignedTo` / `handles`。
- `description`：業務意義。

Link Type 使用時機：

- UI 需要從一個物件 pivot 到另一個物件。
- AI / RAG 需要沿關係取得 context。
- 關係跨系統、跨 database group，不能只依賴 physical FK。
- 關係本身有業務語意，例如替代料、保固涵蓋、組織階層、付款歸屬。

### 4.3 Function：無副作用的邏輯

Function 是純邏輯：輸入、計算、輸出，不改系統狀態。

適合 Function：

- validation：`checkWarranty`, `validatePartNumber`
- calculation：`calculateSLA`, `calculateTotal`
- transformation：`mapSapMaterialToItem`
- aggregation：`summarizeDealerPerformance`
- recommendation：`findAlternatives`
- live read：`checkLiveStock`, `getExchangeRate`

Function 必須有明確 input / output contract，能被 Action 呼叫，也能被 AI tool / UI query 使用。若邏輯會被兩個 workflow 使用，它不應留在 controller 或 frontend 裡。

### 4.4 Action：會改變狀態的操作

Action 是唯一合法的 mutation path。

適合 Action：

- create / update / delete / soft delete
- approve / reject / submit / cancel
- assign / transfer / close / reopen
- sync push / sync pull
- notify / issue / void / redeem

每個 Action 必須有：

- target Object Type。
- preconditions，通常呼叫 Function 或驗證狀態。
- state transition 的 before / after 語意。
- audit log：actor、target、before、after、reason、correlationId。
- compensation：rollback、manual reopen、reverse edit、notify 或 saga step。
- integration event：如果需要 SAP / WMS / MES / downstream app 同步。
- idempotency key：外部呼叫或前台重試時避免重複副作用。

---

## 5. Canonical Object Strategy

Middle Platform 應優先合併重複概念，建立 canonical objects：

| 重複 / 分散概念 | Canonical 方向 | 消費者 |
|---|---|---|
| `ServicePart`, `CostPart`, `Part` | `Item` / `Part` canonical product item | Service, Costing, SuperBOM, Rental |
| `CostExchangeRate`, app-local FX | `Currency`, `ExchangeRate` | Exchange, Costing, SuperBOM |
| `Dealer`, `Store`, sales org variants | `Organization` + `Location` | Platform, Service, Reservation, Dealer Scoring |
| payment variants | `Payment` | Service, Rental, Dealer Scoring, Commerce |
| attachments / invoices / reports | `Document` | Service, Rental, Warranty, Finance |
| address / store / warehouse location | `Location` | Platform, Reservation, Service |
| Service BOM copies | `ServiceBomEntry` + version / overlay model | Service, Costing, SuperBOM |

設計新物件前必須先查：

1. 平台物件目錄是否已有相同概念。
2. Canonical object catalog 是否已有建議取代對象。
3. 既有業務設計文件是否已有整合方向。
4. Consumer contract registry 是否已有 app 依賴既有 API / field。

若必須替換舊 object，採 expand-contract：

1. 新 canonical object 先新增，舊 object 標記 deprecated。
2. 進入雙寫或 projection 期。
3. Consumer contracts 與 API 文件明確標示新舊依賴。
4. 所有 consumers 遷移完成後，舊 API 才可進入 contract phase。

---

## 6. Tenant / Organization Design

巨大機械場景不可把 GSC 當成唯一 tenant key。標準 tenant 與組織階層如下：

```text
ENTERPRISE (tenant boundary)
  ├── SALES_COMPANY / GSC
  ├── MANUFACTURING_COMPANY / GMC
  ├── DEPARTMENT / HQ
  └── channel hierarchy: distributor → dealer → store
```

規範：

- `enterpriseId` 是 hard tenant boundary，由 auth context 取得，不信任 request body。
- `gsc`, `salesCompanyId`, `organizationId`, `storeId` 是業務 scope 或 fine-grained org reference。
- 所有 tenant-scoped table 最終都應有 `enterprise_id` nullable → backfill → not null 的 staged rollout。
- Background jobs、integration processes、data seeds 必須顯式宣告執行 context：enterprise X 或 system / superuser。
- Cross-tenant access 只允許受控 superuser scope，例如 `platform:cross-tenant`，且必須 audit。

---

## 7. Integration / SAP / MES / WMS Design

Canonical model 是整合契約。外部系統映射進平台 Object Types，不反過來讓 Middle Platform 變成 SAP table mirror。

整合分層：

| 層 | 責任 | 不該做的事 |
|---|---|---|
| Connector / Edge Agent | protocol、auth、payload normalization、availability check、dedup | 不做 semantic mapping，不寫 DB，不放 business logic |
| Gateway | authN/Z、tenant routing、rate limit、schema validation、config bundle | 不繞過平台 Actions |
| Adapter / Mapping | staging、mapping template、tenant override、retry、exception queue、audit | 不讓 tenant fork canonical model |
| Middle Platform | Object / Action / Function system of record | 不直接同步等待 SAP 完成 |

Outbound pattern：

1. Action 在同一個 transaction 寫 business record 與 integration event。
2. Integration process 發送至 connector 或 integration endpoint。
3. 成功更新 `erpStatus = SYNCED`, `erpReferenceNumber`, `erpSyncAt`。
4. 失敗進 retry；永久失敗進 exception queue，並把業務物件標成 `ERROR` 或需要人工處理。

Inbound pattern：

1. Connector 產生 envelope，包含 `messageId`, `enterpriseId`, `gsc`, `source`, `objectType`, `operation`, `contractVersion`, `payload`。
2. Gateway 驗證 tenant 與 schema。
3. Integration message 進 staging：`RECEIVED → STAGED → MAPPED → APPLIED` 或 `FAILED`。
4. Applied 必須透過 Action 寫入，不允許直接 table write。
5. Idempotency 以 `enterpriseId + gsc + sourceSystem + messageId` 為準。

---

## 8. Database Grouping and Ownership

Database 應依 bounded business lifecycle 拆成約六個 database groups，不是一個巨型 DB，也不是每個 Object 一個 DB。

| Group | Ownership |
|---|---|
| `platform_core` | identity、organization、auth、platform registry、semantic model、integrations、AI settings、access policies |
| `product_master` | ProductModel、Sku、Item / Part、Service BOM、SuperBOM、attribute / configuration |
| `service_after_sales` | warranty、serial number、service ticket、work order、claim、vendor return |
| `reservation_rental` | booking、resource、store operation、rental vehicle、return |
| `finance_commercial` | currency、exchange rate、dealer scoring、costing、pricing、commercial analytics |
| `manufacturing_bonded` | plant、customs、bonded BOM、declaration、settlement、manufacturing site data |

跨 group 規範：

- 跨 group 不用 DB FK；使用 stable ID + API / projection / event-fed read model。
- 一個 group 不直接寫另一個 group 的 owned tables。
- Cross-domain writes 透過 Action / event。
- Cross-domain reads 透過 API、cache、projection 或 Function resolver。
- Schema evolution 遵守 additive first：新增 nullable / default 欄位，回填，再收斂，不直接加 required、unique、drop。

---

## 9. API Design

標準 API 形狀：

```text
GET    /api/v1/{pbc}
GET    /api/v1/{pbc}/:id
GET    /api/v1/{pbc}/:id/{relationship}
POST   /api/v1/{pbc}/commands/:action

POST   /api/v1/{pbc}/functions/:function
GET    /api/v1/{pbc}/:id/links
GET    /api/v1/{pbc}/:id/links/:linkName
```

規範：

- Read endpoints 必須 paginated、filterable、cacheable，且無副作用。
- Writes 必須是 explicit command / Action，不用模糊的裸 `PATCH` 變更共享業務狀態。
- Request / response schema 必須有型別與驗證規則；API handler 保持薄，service / Function / Action 放業務邏輯。
- API response 與 API 文件必須同步。
- breaking change 必須走 deprecation / versioning，不可直接移除欄位。
- 每個 downstream app 的依賴要登記在 consumer contract registry。

---

## 10. Front Office Contract and API Documentation

Front Office 與 Middle Platform 的關係必須是 contract-based integration，不是「前台工程師知道後端 schema 長怎樣」。前台只依賴公開 API 文件、consumer declaration、domain event contract；不可依賴資料庫、ORM model、private schema 或平台內部實作。

### 10.1 Contract 種類

| Contract | 用途 | Source of truth | 誰維護 |
|---|---|---|---|
| API specification | REST endpoint、request / response schema、status code | API documentation registry | Platform team 產生，consumer review |
| Consumer declaration | 前台宣告自己使用哪些 endpoint / fields | Consumer contract registry | App team 擁有，Platform gate 驗證 |
| API catalog | 給人看的 API 文件與整合指南 | API specification + curated docs | Platform / PBC owner |
| Event contract | Domain events、integration payload | Event specification 或 event markdown | PBC owner |
| Semantic contract | Object Types、Links、Functions、Actions | Semantic model registry | Platform / PBC owner |
| Auth contract | scopes、roles、session / service-to-service 行為 | Auth standard and security docs | Platform security owner |

### 10.2 Front Office Integration Rules

前台系統必須遵守：

1. 只透過 Middle Platform published APIs 讀資料，不直接讀 DB、不讀 data lake、不抓 private endpoint。
2. 所有寫入都呼叫 Action / command endpoint，不直接 POST / PATCH 共享資料表狀態。
3. 每個 write request 必須具備 idempotency 設計，避免重送造成重複副作用。
4. 所有 request 的 tenant / org scope 由登入身份推導；前台不可自行提交 `enterpriseId` 作為信任來源。
5. 前台只使用 API specification、approved client SDK 或 documented SDK，不 copy 平台內部型別。
6. 前台若開始依賴新 endpoint 或新欄位，必須同步更新自己的 consumer declaration。
7. 前台若停止依賴某欄位，也要更新 declaration，避免平台被過期 contract 鎖住。
8. 前台 cache master data 必須遵守 API 文件宣告的 TTL / invalidation rule。
9. 前台不能重寫平台已有 Function 的業務邏輯，例如自行算 warranty eligibility、ATP promising、exchange rate。

### 10.3 Consumer Declaration 格式

每個前台 App 必須在 consumer contract registry 宣告依賴。這是「前台跟平台的契約」，不是測試輔助檔。

```jsonc
{
  "app": "Giant-Service-Platform",
  "owner": "service-platform-team",
  "consumes": [
    {
      "endpoint": "GET /api/v1/service-tickets",
      "responseSchema": "ServiceTicketResponseDto",
      "fields": ["id", "status", "priority", "createdAt"]
    },
    {
      "endpoint": "POST /api/v1/service-tickets/commands/open-ticket"
    },
    {
      "endpoint": "GET /api/v1/reservation/resources",
      "responseSchema": "ReservationResourceResponseDto",
      "fields": [
        { "name": "id", "type": "string" },
        { "name": "capacity", "type": "number" }
      ],
      "smoke": true
    }
  ]
}
```

規範：

- `endpoint` 使用 `"METHOD /path"`，必須能對上 API specification。
- `responseSchema` 對應 API specification 中定義的 response schema。
- `fields` 只列前台實際讀取的欄位，不要把整個 schema 都列進去。
- 若前台依賴型別不可變，使用 `{ "name": "...", "type": "..." }`。
- 有 path params 或需要 fixture 的 GET，可設 `"smoke": false`，仍受 static contract gate 保護。
- 新增 app 時，第一個整合 PR 就要新增 manifest，不等上線後補。

### 10.4 API Documentation Standards

每個 PBC / module 的 API 文件至少要包含：

```text
PBC / Module:
  owner:
  base path:
  auth scopes:
  tenant behavior:
  read endpoints:
    - method / path / filters / pagination / cache TTL
  action endpoints:
    - action name / command path / idempotency / preconditions
  request schemas:
  response schemas:
  error codes:
  domain events:
  version:
  deprecation notes:
  consumer apps:
```

API specification 必須描述：

- request body、query params、path params。
- response schema，尤其是前台會讀的欄位。
- error response：`400`, `401`, `403`, `404`, `409`, `422`, `500` 的語意。
- auth requirement 與 required scopes。
- pagination model：`page/limit`、`cursor` 或其他一致格式。
- idempotency requirement。
- deprecated fields / endpoints。

文件不應只靠手寫 README。API specification 是契約來源；Markdown 是補充語意、範例與操作規則。

### 10.5 API Versioning and Breaking Change Policy

Middle Platform 預設遵守 backward compatible evolution。

**安全變更：**

- 新增 optional response field。
- 新增 optional request field。
- 新增 endpoint。
- 新增 enum value，但前台需能容忍 unknown value。
- 新增 action，不改既有 action 語意。

**Breaking changes：**

- 移除 endpoint。
- 移除或 rename response field。
- 改變欄位型別，例如 string → number。
- 讓 optional field 變 required。
- 改變 status code 語意。
- 改變 auth / scope requirement。
- 改變 enum 並讓前台無法處理舊值。
- 改變 Action precondition，導致既有合法流程變成 rejected。

Breaking change 必須走 expand-contract：

```text
1. Add new field / endpoint / action version
2. Keep old contract alive
3. Update API specification
4. Update affected consumer declarations
5. Migrate each frontend
6. Observe smoke / telemetry
7. Mark old field deprecated
8. Remove only after all consumer declarations stop declaring it
```

建議版本策略：

- Public REST 使用 `/api/v1/...`。
- 重大 breaking change 建 `/api/v2/...`，不要直接改 v1。
- Action 可用 action name version，例如 `OpenTicketV2`，或在 action definition 內宣告 `version`。
- Event contract 使用 `eventType` + `schemaVersion`。
- Mapping / integration contract 使用 `contractVersion`。

### 10.6 Approved Clients and SDK

前台建議使用 approved client SDK 或由 API specification 產生的 client，而不是手寫 API 呼叫與型別。

Client / SDK 必須達成：

- response shape 變更在 build time 被發現。
- auth / credentials / CSRF / cookie 行為集中管理。
- pagination、error envelope、idempotency key、retry policy 一致。
- 不在每個前台 App 複製 platform-client。

最低標準：

- 集中處理認證與 session。
- 集中處理 command / Action 呼叫。
- 集中處理錯誤與 retry。
- 由 API specification 驅動型別，避免人工複製 response shape。

前台不得 import 後端內部型別；只能依賴 approved SDK 或正式發布的 client package。

### 10.7 Error Contract

所有 API 錯誤應維持一致 envelope，避免前台每個 endpoint 寫不同分支。

```jsonc
{
  "error": {
    "code": "SERVICE_TICKET_NOT_FOUND",
    "message": "Service ticket not found",
    "details": {},
    "traceId": "req_..."
  }
}
```

建議 status code 語意：

| Status | 語意 |
|---|---|
| `400` | request 格式錯誤、query invalid |
| `401` | 未登入或 token invalid |
| `403` | 已登入但 scope / tenant / ownership 不允許 |
| `404` | resource 或 endpoint 不存在 |
| `409` | state conflict，例如重複、版本衝突、已被處理 |
| `422` | Action precondition 不通過 |
| `429` | rate limit |
| `500` | 未預期錯誤 |

前台可以根據 `error.code` 顯示 domain-specific 訊息；不應 parse `message`。

### 10.8 Contract Gates in Development Flow

改 API / schema 時，開發流程要包含：

```text
API / schema changed
  |
  v
Update API specification
  |
  v
Update consumer declaration if dependency changed
  |
  v
Run contract gate
  |
  v
Run frontend / post-deploy checks for affected apps
```

平台 QA gate：

- public endpoint / schema 變更，API specification 必須更新。
- 如果 API surface 變更但沒有更新任何 consumer declaration，PR 必須明確說明「沒有 declared consumer 受影響」。
- contract gate fail 時，不可以刪 declaration 來讓 CI 綠；要 expand-contract 或協調 consumer migration。

### 10.9 API Catalog for Giant Teams

巨大機械團隊需要可被搜尋與審查的 API catalog，而不是散落的 README。

API catalog 每個 PBC 頁面應顯示：

- PBC owner / support channel。
- API maturity：draft / beta / stable / deprecated。
- Base URL：dev / UAT / prod。
- Auth type：session / service token / API key / connector。
- Required scopes。
- API specification link。
- Example requests。
- Known consumers。
- SLA / rate limit。
- Deprecation timeline。
- Domain events。
- Data ownership statement。

API catalog 應由 API specification + curated markdown 組成，並透過 portal 或 API management tool 對前台團隊發布。

---

## 11. Auth, Access, and Security

Middle Platform 是共享服務層，安全要在平台層統一，而不是每個 App 自行補。

設計要求：

- 所有路由預設 protected；只 whitelist service availability check、login / callback 等必要端點。
- 支援 end-user session 與 service-to-service token。
- 前台用 HttpOnly session cookie，不把 access token 放 localStorage。
- 每個 endpoint 宣告 required scope；細粒度資源操作用 ownership / enterprise / org filter。
- `enterpriseId` 由 session / service identity / org ancestry 解出，不接受前台提交。
- Secrets 放 secret manager 或環境秘密，不進 code、不進 frontend env。
- External connector credentials 依 enterprise namespace 管理；edge agent 只對外連線，不開 inbound port。
- 所有 Action、integration、cross-tenant access 要 audit。

---

## 12. Semantic Model and AI Readiness

Middle Platform 的價值不只在 API，而在 AI-ready semantic layer。

Semantic layer 必須提供：

- Object Type、Link Type、Function、Action、Integration metadata。
- Core / Extension semantic layering。
- Effective semantic model。
- Ontology export or equivalent machine-readable model。
- Mapping rules。
- Record access layer。
- Link traversal capability。
- Action execution with audit log and integration event。
- Integration event delivery with retry and exception handling。

AI-readiness 規範：

- Object Types 形成 shared vocabulary。
- Link Types 形成可遍歷 knowledge graph。
- Functions 提供可測試、可重用、可作為 AI tool 的邏輯。
- Actions 提供受控的 AI 操作邊界：AI 可建議或執行 Action，但必須經過權限、precondition、audit。
- Mapping Rules 讓 external systems 成為 canonical model 的來源之一，而不是把企業語意拆散。
- AI / RAG context 應由 effective semantic model + record links + recent events 組成，不靠前端 hardcode。

---

## 13. Release and Regression Guardrails

Middle Platform 是所有 App 的共用骨幹，因此任何 schema / API / auth / semantic change 都要被機器攔截。

必跑 gate：

1. **Contract gate**：比對 consumer contract registry 與 API specification。
2. **API documentation freshness**：public endpoint / schema 變更必須重新發布 API specification。
3. **Schema compatibility gate**：阻擋不相容的 required field、unique constraint、drop、narrowing change。
4. **Build / typecheck / tests**：確保服務、schema、資料存取層都可編譯並通過測試。
5. **Post-deploy verification**：部署後驗證 service availability 與 downstream consumer declarations 宣告的 routes。

改 schema 的預設策略：

- 新欄位 nullable / default first。
- rename 用 expand-contract：new column + dual write + backfill + consumer migration + old column retire。
- drop / required / unique 是最後階段，不是第一階段。
- API response 欄位不可直接移除；先 deprecated，再等 consumer declarations 全部遷移。

---

## 14. Design Review Checklist

開任何 Middle Platform 設計或 PR 前，至少回答：

### Capability ownership

- 這是 shared PBC 還是 app-local capability？
- 哪個 Object Type / PBC 是 source of truth？
- 哪些 apps 是 consumers？是否更新 consumer declaration？

### Object / Link modeling

- 這個概念是否已有 canonical Object Type？
- 新 Object Type 是否有 identity、lifecycle、reuse 或 multiplicity？
- 欄位型別、required、select options 是否明確？
- Links 是否有 semantic name、cardinality、reverseName？
- 是否避免把 1:N / queryable data 藏在 JSON？

### Function / Action boundary

- 純邏輯是否放在 Function，而不是 controller / frontend？
- 所有 state changes 是否走 Action？
- Action 是否有 precondition、audit、compensation、idempotency？
- 外部同步是否使用非同步整合事件，而不是同步等待 SAP？

### Tenant and security

- Tenant-scoped rows 是否有 `enterpriseId`，且 query/write 由 auth context enforce？
- GSC / org / store 是否只是業務 scope，而非 tenant key？
- Scope / ownership / cross-tenant access 是否明確？
- Secrets 是否完全不在 code / frontend env？

### Integration

- External payload 是否映射進 canonical model，而非建立平行模型？
- Connector 是否只做 protocol-adjacent work？
- Mapping template / override 是否可版本化、驗證、回放？
- Error / retry / exception queue / monitoring 是否設計完整？

### Release safety

- 是否 additive first？
- API specification 是否更新？
- Consumer declarations 是否更新？
- Schema compatibility gate 是否會通過？
- Post-deploy / contract tests 是否涵蓋受影響 apps？

---

## 15. Anti-Patterns

| Anti-pattern | 問題 | 正確做法 |
|---|---|---|
| 前台直接寫 shared DB | 繞過權限、precondition、audit、ERP sync | 透過 Action / command |
| 每個 App 自己定義 Product / Dealer / Currency | 資料漂移、整合困難 | 使用 canonical Object Type |
| 把業務規則寫在 frontend | 權限與結果不可控，無法重用 | 抽成 Function / rule config |
| Action 裡內嵌大量計算 | 不能測試與重用 | Action 呼叫 Function |
| SAP 同步放在 user request path | SAP 慢或掛掉會拖垮前台 | Asynchronous integration event |
| 只用 `gsc` 當 tenant key | 跨 enterprise 資料外洩風險 | `enterpriseId` hard boundary + GSC business scope |
| Link 沒有 reverseName | 不能可靠 pivot / AI traversal | 每個 Link 定義反向語意 |
| 直接刪欄位或改 required | 下游 App runtime break / deploy crash | expand-contract |
| Tenant 客製 fork canonical model | 長期不可維護 | Core model + extension / overlay |
| Consumer 沒有 declaration | 平台改動無法自動保護 | 更新 consumer contract registry |
| 前台手寫私有型別 | schema drift，runtime 才爆 | 使用 approved SDK |
| API 文件只寫 README 不更新 API specification | contract gate 失效 | API specification + curated docs |
| 改 status code 沒宣告 | 前台錯誤處理失效 | error contract + deprecation note |

---

## 16. Platform Capability Requirements

### P0：可治理骨幹

- Enterprise tenancy 必須有共享 tenant filter、session-level enterprise identity、background context、per-domain backfill discipline。
- Action / Function execution 必須有安全邊界、測試覆蓋與 audit trail；所有 mutation 必須走 Action。
- Integration event delivery 必須使用 durable message bus 或等效機制。
- API specification 與 consumer declarations 必須覆蓋所有 live Front Office apps。

### P1：Ontology 可見、可走、可操作

- Object Explorer 必須能依 Object Type 瀏覽 records、follow links、查看 audit / lineage。
- Ontology Manager 必須能管理 Object Type、Link Type、Function、Action、Mapping Rule。
- Link traversal 必須支援 domain records / projections，不限於單一 storage pattern。
- Function execution 必須採隔離執行環境，避免 dynamic logic 成為安全缺口。

### P2：產品化外部接入

- Connector catalog 必須提供 certified connector versions 與 mapping templates。
- Connector runtime 必須支援 edge agent / managed connector dual-mode。
- Tenant onboarding 必須支援 enterprise、systems、credentials、mapping、dry-run、activate。
- Integration monitoring 必須涵蓋 staging、exception queue、sync status、replay。

---

## 相關筆記

- [[Giant Middle Platform — Design Guidelines]]
- [[Giant Group — Middle Platform (Middle Office) Summary]]
