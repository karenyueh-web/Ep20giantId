// 導入原始Dashboard的所有必要組件和資源
import svgPaths from "@/imports/svg-d84x18jyny";
import imgStack from "figma:asset/1a64bb29b96d52f74d342ea173c7a5a5756e6710.png";
import imgImgAvatar25 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";
import imgImgAvatar26 from "figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png";
import imgAvatar from "figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png";
import imgAvatar1 from "figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png";

// 這個文件將包含從Dashboard提取出來的所有內容組件
// 由於Dashboard組件非常龐大，我們先創建一個簡化版本

export function DashboardPageContent() {
  return (
    <div className="absolute h-[830px] left-[304px] top-[114px] w-[1080px]">
      <div className="absolute bg-white h-[830px] left-0 rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] top-0 w-[1080px]">
        <div className="p-8">
          <h2 className="text-xl font-semibold text-[#1c252e] mb-4">訂單統計</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#f9fafb] p-4 rounded-lg">
              <p className="text-sm text-[#637381]">新訂單</p>
              <p className="text-2xl font-bold text-[#1c252e] mt-2">32</p>
            </div>
            <div className="bg-[#f9fafb] p-4 rounded-lg">
              <p className="text-sm text-[#637381]">廠商總採購訂單</p>
              <p className="text-2xl font-bold text-[#1c252e] mt-2">156</p>
            </div>
            <div className="bg-[#f9fafb] p-4 rounded-lg">
              <p className="text-sm text-[#637381]">Pending訂單</p>
              <p className="text-2xl font-bold text-[#1c252e] mt-2">8</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#1c252e] mb-4">訂單列表</h3>
            <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f9fafb]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#637381]">公司</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#637381]">採購組織</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#637381]">訂單號碼</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#637381]">現次數</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#637381]">訂單日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#e5e7eb]">
                    <td className="px-4 py-3 text-sm text-[#1c252e]">巨大機械</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">台灣總生產採購組織</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">Z2QB</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">400000105410</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">5</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb]">
                    <td className="px-4 py-3 text-sm text-[#1c252e]">GVM</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">GVM</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">Z2QB</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">400051332020</td>
                    <td className="px-4 py-3 text-sm text-[#1c252e]">20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
