<#
.SYNOPSIS
    Recover Antigravity Conversations
.DESCRIPTION
    This script scans the local Antigravity data directory, extracts conversation
    metadata and transcripts, and generates:
    1. An HTML index page listing all conversations with titles and dates
    2. Individual markdown files for each conversation with full transcript
    3. A summary JSON file with all conversation metadata
.NOTES
    Run this script from PowerShell. Output will be saved to a "recovered_conversations" folder.
#>

param(
    [string]$AntigravityDir = "$env:USERPROFILE\.gemini\antigravity",
    [string]$OutputDir = "$PSScriptRoot\recovered_conversations"
)

$ErrorActionPreference = "Continue"

# ============================================================
# Setup
# ============================================================
Write-Host "=== Antigravity Conversation Recovery Tool ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Antigravity data directory: $AntigravityDir"
Write-Host "Output directory: $OutputDir"
Write-Host ""

if (-not (Test-Path $AntigravityDir)) {
    Write-Host "ERROR: Antigravity data directory not found at $AntigravityDir" -ForegroundColor Red
    exit 1
}

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
$transcriptsDir = Join-Path $OutputDir "transcripts"
if (-not (Test-Path $transcriptsDir)) {
    New-Item -ItemType Directory -Path $transcriptsDir -Force | Out-Null
}
$mediaDir = Join-Path $OutputDir "media"
if (-not (Test-Path $mediaDir)) {
    New-Item -ItemType Directory -Path $mediaDir -Force | Out-Null
}

# ============================================================
# Step 1: Extract conversation titles from summaries protobuf
# ============================================================
Write-Host "Step 1: Extracting conversation metadata..." -ForegroundColor Yellow

$summariesFile = Join-Path $AntigravityDir "agyhub_summaries_proto.pb"
$titleMap = @{}

if (Test-Path $summariesFile) {
    $bytes = [System.IO.File]::ReadAllBytes($summariesFile)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    # Extract readable strings
    $readable = [regex]::Matches($text, '[\x20-\x7E\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]{4,}')
    $allStrings = $readable | ForEach-Object { $_.Value }
    
    $convoPattern = '\$([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'
    
    for ($i = 0; $i -lt $allStrings.Count - 1; $i++) {
        if ($allStrings[$i] -match $convoPattern) {
            $id = $matches[1]
            $next = $allStrings[$i+1]
            if ($next -notmatch 'file://|github\.com|karenyueh|giantId' -and $next -notmatch $convoPattern -and $next -notmatch '^main$') {
                $title = $next.TrimStart('$"&% !#()*,')
                if ($title.Length -gt 3 -and $title -notmatch '^(browser|research|outside-of-project)$') {
                    if (-not $titleMap.ContainsKey($id)) {
                        $titleMap[$id] = $title
                    }
                }
            }
        }
    }
    Write-Host "  Found $($titleMap.Count) conversation titles in summaries" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Summaries file not found" -ForegroundColor DarkYellow
}

# ============================================================
# Step 2: Scan conversation files and brain folders
# ============================================================
Write-Host "Step 2: Scanning conversation data files..." -ForegroundColor Yellow

$convosDir = Join-Path $AntigravityDir "conversations"
$brainDir = Join-Path $AntigravityDir "brain"

# Collect all unique conversation IDs from both directories
$allIds = @{}

# From conversation files (.pb and .db)
if (Test-Path $convosDir) {
    Get-ChildItem $convosDir -File | ForEach-Object {
        $baseName = $_.BaseName
        if ($baseName -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            if (-not $allIds.ContainsKey($baseName)) {
                $allIds[$baseName] = @{
                    Id = $baseName
                    ConvoFile = $_.FullName
                    ConvoFormat = $_.Extension
                    ConvoSize = $_.Length
                    ConvoLastWrite = $_.LastWriteTime
                    HasTranscript = $false
                    TranscriptLines = 0
                    Title = ""
                    FirstMessage = ""
                    CreatedAt = $null
                    LastModified = $null
                    MediaFiles = @()
                    ArtifactFiles = @()
                }
            } else {
                # Update with the latest file info (prefer .db over .pb)
                if ($_.Extension -eq ".db" -and $allIds[$baseName].ConvoFormat -ne ".db") {
                    $allIds[$baseName].ConvoFile = $_.FullName
                    $allIds[$baseName].ConvoFormat = $_.Extension
                    $allIds[$baseName].ConvoSize = $_.Length
                }
            }
        }
    }
}

# From brain folders
if (Test-Path $brainDir) {
    Get-ChildItem $brainDir -Directory | Where-Object { $_.Name -ne 'tempmediaStorage' } | ForEach-Object {
        $id = $_.Name
        if ($id -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
            if (-not $allIds.ContainsKey($id)) {
                $allIds[$id] = @{
                    Id = $id
                    ConvoFile = $null
                    ConvoFormat = "N/A"
                    ConvoSize = 0
                    ConvoLastWrite = $_.LastWriteTime
                    HasTranscript = $false
                    TranscriptLines = 0
                    Title = ""
                    FirstMessage = ""
                    CreatedAt = $null
                    LastModified = $_.LastWriteTime
                    MediaFiles = @()
                    ArtifactFiles = @()
                }
            }
            
            # Check for transcript
            $transcriptPath = Join-Path $_.FullName ".system_generated\logs\transcript.jsonl"
            if (Test-Path $transcriptPath) {
                $allIds[$id].HasTranscript = $true
                $allIds[$id].TranscriptLines = (Get-Content $transcriptPath | Measure-Object).Count
            }
            
            # Check for media files
            $mediaFiles = Get-ChildItem $_.FullName -File -Filter "media__*" -ErrorAction SilentlyContinue
            if ($mediaFiles) {
                $allIds[$id].MediaFiles = @($mediaFiles | ForEach-Object { $_.FullName })
            }
            
            # Check for artifacts
            $artifactFiles = Get-ChildItem $_.FullName -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "media__*" }
            if ($artifactFiles) {
                $allIds[$id].ArtifactFiles = @($artifactFiles | ForEach-Object { $_.FullName })
            }
        }
    }
}

# Apply titles from summaries
foreach ($id in $allIds.Keys) {
    if ($titleMap.ContainsKey($id)) {
        $allIds[$id].Title = $titleMap[$id]
    }
}

Write-Host "  Found $($allIds.Count) total conversations" -ForegroundColor Green
$withTranscript = ($allIds.Values | Where-Object { $_.HasTranscript }).Count
Write-Host "  Conversations with transcripts: $withTranscript" -ForegroundColor Green

# ============================================================
# Step 3: Extract transcripts and build conversation details
# ============================================================
Write-Host "Step 3: Extracting conversation transcripts..." -ForegroundColor Yellow

$conversations = @()

foreach ($entry in $allIds.Values | Sort-Object { $_.ConvoLastWrite } -Descending) {
    $id = $entry.Id
    $convo = @{
        id = $id
        title = $entry.Title
        format = $entry.ConvoFormat
        has_transcript = $entry.HasTranscript
        transcript_lines = $entry.TranscriptLines
        media_count = $entry.MediaFiles.Count
        created_at = $null
        last_modified = if ($entry.ConvoLastWrite) { $entry.ConvoLastWrite.ToString("yyyy-MM-dd HH:mm:ss") } else { "Unknown" }
        first_user_message = ""
        messages = @()
    }
    
    if ($entry.HasTranscript) {
        $transcriptPath = Join-Path $brainDir "$id\.system_generated\logs\transcript.jsonl"
        try {
            $lines = Get-Content $transcriptPath -Encoding UTF8
            $messages = @()
            
            foreach ($line in $lines) {
                try {
                    $step = $line | ConvertFrom-Json
                    
                    # Extract creation timestamp
                    if ($step.created_at -and -not $convo.created_at) {
                        $convo.created_at = $step.created_at
                    }
                    
                    # Collect user messages and model responses
                    if ($step.type -eq "USER_INPUT" -and $step.content) {
                        # Clean up the content - extract just the user request
                        $content = $step.content
                        if ($content -match '<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>') {
                            $content = $matches[1]
                        }
                        $messages += @{
                            role = "user"
                            content = $content
                            timestamp = $step.created_at
                        }
                        if (-not $convo.first_user_message) {
                            $convo.first_user_message = $content
                            # If no title, use first message as title
                            if (-not $convo.title) {
                                $convo.title = if ($content.Length -gt 60) { $content.Substring(0, 60) + "..." } else { $content }
                            }
                        }
                    }
                    elseif ($step.type -eq "PLANNER_RESPONSE" -and $step.content) {
                        $messages += @{
                            role = "assistant"
                            content = $step.content
                            timestamp = $step.created_at
                        }
                    }
                    elseif ($step.type -and $step.status) {
                        # Tool calls and other actions
                        $toolInfo = ""
                        if ($step.tool_calls) {
                            $toolNames = ($step.tool_calls | ForEach-Object { 
                                if ($_.name) { $_.name } 
                                elseif ($_.PSObject.Properties['type']) { $_.type }
                            }) -join ", "
                            $toolInfo = " [Tools: $toolNames]"
                        }
                        $messages += @{
                            role = "system"
                            content = "[$($step.type)] Status: $($step.status)$toolInfo"
                            timestamp = $step.created_at
                        }
                    }
                } catch {
                    # Skip malformed lines
                }
            }
            
            $convo.messages = $messages
            
            # Update last modified from the last message timestamp
            if ($messages.Count -gt 0) {
                $lastMsg = $messages[-1]
                if ($lastMsg.timestamp) {
                    $convo.last_modified = $lastMsg.timestamp
                }
            }
        } catch {
            Write-Host "  WARNING: Could not read transcript for $id`: $_" -ForegroundColor DarkYellow
        }
        
        # Export individual transcript as markdown
        $mdContent = "# $($convo.title)`n`n"
        $mdContent += "**Conversation ID:** ``$id```n"
        $mdContent += "**Created:** $($convo.created_at)`n"
        $mdContent += "**Last Modified:** $($convo.last_modified)`n"
        $mdContent += "**Format:** $($convo.format)`n"
        $mdContent += "**Media Files:** $($entry.MediaFiles.Count)`n`n"
        $mdContent += "---`n`n"
        
        foreach ($msg in $convo.messages) {
            $icon = switch ($msg.role) {
                "user" { "👤 **User**" }
                "assistant" { "🤖 **Assistant**" }
                "system" { "⚙️ *System*" }
            }
            $ts = if ($msg.timestamp) { " _($($msg.timestamp))_" } else { "" }
            $mdContent += "### $icon$ts`n`n"
            $mdContent += "$($msg.content)`n`n"
            $mdContent += "---`n`n"
        }
        
        $mdFile = Join-Path $transcriptsDir "$id.md"
        $mdContent | Out-File -FilePath $mdFile -Encoding UTF8
    }
    
    # Copy media files
    foreach ($mediaFile in $entry.MediaFiles) {
        $destFile = Join-Path $mediaDir "$id`_$(Split-Path $mediaFile -Leaf)"
        if (-not (Test-Path $destFile)) {
            Copy-Item $mediaFile $destFile -ErrorAction SilentlyContinue
        }
    }
    
    $conversations += $convo
}

Write-Host "  Exported $($conversations.Count) conversations" -ForegroundColor Green

# ============================================================
# Step 4: Generate summary JSON
# ============================================================
Write-Host "Step 4: Generating summary JSON..." -ForegroundColor Yellow

$summaryData = $conversations | ForEach-Object {
    @{
        id = $_.id
        title = $_.title
        format = $_.format
        has_transcript = $_.has_transcript
        transcript_lines = $_.transcript_lines
        media_count = $_.media_count
        created_at = $_.created_at
        last_modified = $_.last_modified
        first_user_message = $_.first_user_message
        message_count = $_.messages.Count
    }
}

$summaryJson = $summaryData | ConvertTo-Json -Depth 3
$summaryJson | Out-File -FilePath (Join-Path $OutputDir "conversations_summary.json") -Encoding UTF8
Write-Host "  Summary saved to conversations_summary.json" -ForegroundColor Green

# ============================================================
# Step 5: Generate HTML index page
# ============================================================
Write-Host "Step 5: Generating HTML index page..." -ForegroundColor Yellow

$htmlContent = @"
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antigravity Conversations Recovery</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --bg-primary: #0f0f1a;
            --bg-secondary: #1a1a2e;
            --bg-card: #16213e;
            --bg-card-hover: #1a2740;
            --text-primary: #e8e8f0;
            --text-secondary: #a0a0b8;
            --text-muted: #6b6b80;
            --accent: #7c3aed;
            --accent-light: #a78bfa;
            --accent-glow: rgba(124, 58, 237, 0.3);
            --border: rgba(255, 255, 255, 0.08);
            --success: #34d399;
            --warning: #fbbf24;
            --danger: #f87171;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            text-align: center;
            padding: 3rem 0;
            border-bottom: 1px solid var(--border);
            margin-bottom: 2rem;
        }
        
        header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent-light), #60a5fa, var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }
        
        header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--accent-light);
        }
        
        .stat-label {
            color: var(--text-muted);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .search-box {
            flex: 1;
            min-width: 300px;
            padding: 0.75rem 1rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }
        
        .search-box:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-glow);
        }
        
        .filter-btn {
            padding: 0.75rem 1.25rem;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .filter-btn:hover, .filter-btn.active {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }
        
        .conversation-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .conversation-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            cursor: pointer;
            transition: all 0.25s ease;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 1rem;
        }
        
        .conversation-card:hover {
            background: var(--bg-card-hover);
            border-color: var(--accent);
            box-shadow: 0 4px 20px var(--accent-glow);
            transform: translateY(-1px);
        }
        
        .conversation-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }
        
        .conversation-meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .conversation-meta span {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .conversation-preview {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 800px;
        }
        
        .badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .badge-transcript {
            background: rgba(52, 211, 153, 0.15);
            color: var(--success);
            border: 1px solid rgba(52, 211, 153, 0.3);
        }
        
        .badge-pb {
            background: rgba(251, 191, 36, 0.15);
            color: var(--warning);
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .badge-media {
            background: rgba(96, 165, 250, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(96, 165, 250, 0.3);
        }
        
        .badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        /* Modal for transcript viewing */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .modal-overlay.active {
            display: flex;
        }
        
        .modal {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 16px;
            max-width: 900px;
            width: 95%;
            max-height: 85vh;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .modal h2 {
            margin-bottom: 1rem;
            color: var(--accent-light);
        }
        
        .modal-close {
            float: right;
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
        }
        
        .modal-close:hover {
            color: var(--text-primary);
        }
        
        .message {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 8px;
            border-left: 3px solid transparent;
        }
        
        .message.user {
            background: rgba(124, 58, 237, 0.1);
            border-left-color: var(--accent);
        }
        
        .message.assistant {
            background: rgba(52, 211, 153, 0.08);
            border-left-color: var(--success);
        }
        
        .message.system {
            background: rgba(255, 255, 255, 0.03);
            border-left-color: var(--text-muted);
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .message-role {
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }
        
        .message.user .message-role { color: var(--accent-light); }
        .message.assistant .message-role { color: var(--success); }
        .message.system .message-role { color: var(--text-muted); }
        
        .message-content {
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.7;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
            font-size: 0.85rem;
            border-top: 1px solid var(--border);
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔮 Antigravity Conversation Recovery</h1>
            <p>Recovered conversations from local data — $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
        </header>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">$($conversations.Count)</div>
                <div class="stat-label">Total Conversations</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$withTranscript</div>
                <div class="stat-label">With Full Transcript</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$(($conversations | Where-Object { $_.media_count -gt 0 }).Count)</div>
                <div class="stat-label">With Media Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$(($conversations | Where-Object { $_.format -eq ".pb" }).Count)</div>
                <div class="stat-label">Legacy Format (.pb)</div>
            </div>
        </div>
        
        <div class="filters">
            <input type="text" class="search-box" id="searchBox" placeholder="🔍 Search conversations by title or content...">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="transcript">With Transcript</button>
            <button class="filter-btn" data-filter="media">With Media</button>
        </div>
        
        <div class="conversation-list" id="conversationList">
"@

foreach ($convo in $conversations) {
    $badges = ""
    if ($convo.has_transcript) {
        $badges += '<span class="badge badge-transcript">📝 Transcript</span>'
    }
    if ($convo.format -eq ".pb") {
        $badges += '<span class="badge badge-pb">📦 Legacy</span>'
    }
    if ($convo.media_count -gt 0) {
        $badges += "<span class=`"badge badge-media`">🖼️ $($convo.media_count) media</span>"
    }
    
    $title = if ($convo.title) { [System.Web.HttpUtility]::HtmlEncode($convo.title) } else { "<em>Untitled</em>" }
    $preview = if ($convo.first_user_message) {
        $p = $convo.first_user_message
        if ($p.Length -gt 120) { $p = $p.Substring(0, 120) + "..." }
        [System.Web.HttpUtility]::HtmlEncode($p)
    } else { "" }
    
    $dataAttr = ""
    if ($convo.has_transcript) { $dataAttr += ' data-has-transcript="true"' }
    if ($convo.media_count -gt 0) { $dataAttr += ' data-has-media="true"' }
    
    $transcriptFile = if ($convo.has_transcript) { "transcripts/$($convo.id).md" } else { "" }
    
    $htmlContent += @"
            <div class="conversation-card" data-id="$($convo.id)" data-title="$title" data-preview="$preview"$dataAttr onclick="$(if ($convo.has_transcript) { "openTranscript('$($convo.id)')" } else { "alert('This conversation uses legacy format (.pb). The conversation data exists but cannot be decoded as plain text. The protobuf file is preserved in the conversations directory.')" })">
                <div>
                    <div class="conversation-title">$title</div>
                    <div class="conversation-meta">
                        <span>🆔 $($convo.id.Substring(0, 8))...</span>
                        <span>📅 $($convo.last_modified)</span>
                        $(if ($convo.transcript_lines -gt 0) { "<span>💬 $($convo.transcript_lines) steps</span>" })
                        $(if ($convo.message_count -gt 0) { "<span>📨 $($convo.message_count) messages</span>" })
                    </div>
                    $(if ($preview) { "<div class=`"conversation-preview`">$preview</div>" })
                </div>
                <div class="badges">$badges</div>
            </div>

"@
}

$htmlContent += @"
        </div>
        
        <div class="no-results" id="noResults" style="display:none;">
            <p>🔍 No conversations match your search.</p>
        </div>
    </div>
    
    <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
            <button class="modal-close" onclick="closeModal()">✕</button>
            <h2 id="modalTitle"></h2>
            <div id="modalContent"></div>
        </div>
    </div>
    
    <footer>
        <p>Recovered by Antigravity Conversation Recovery Script • Data from $AntigravityDir</p>
    </footer>
    
    <script>
        // Conversation data (embedded)
        const conversationData = $(($conversations | Where-Object { $_.has_transcript } | ForEach-Object {
            $msgs = $_.messages | ForEach-Object {
                @{
                    role = $_.role
                    content = $_.content
                    timestamp = $_.timestamp
                }
            }
            @{
                id = $_.id
                title = $_.title
                messages = $msgs
            }
        }) | ConvertTo-Json -Depth 4 -Compress);
        
        // Search functionality
        const searchBox = document.getElementById('searchBox');
        const cards = document.querySelectorAll('.conversation-card');
        const noResults = document.getElementById('noResults');
        
        searchBox.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            let visible = 0;
            cards.forEach(card => {
                const title = card.dataset.title?.toLowerCase() || '';
                const preview = card.dataset.preview?.toLowerCase() || '';
                const id = card.dataset.id?.toLowerCase() || '';
                const match = title.includes(query) || preview.includes(query) || id.includes(query);
                card.style.display = match ? '' : 'none';
                if (match) visible++;
            });
            noResults.style.display = visible === 0 ? '' : 'none';
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                let visible = 0;
                cards.forEach(card => {
                    let show = true;
                    if (filter === 'transcript') show = card.dataset.hasTranscript === 'true';
                    if (filter === 'media') show = card.dataset.hasMedia === 'true';
                    card.style.display = show ? '' : 'none';
                    if (show) visible++;
                });
                noResults.style.display = visible === 0 ? '' : 'none';
            });
        });
        
        // Modal
        function openTranscript(id) {
            const convo = conversationData.find(c => c.id === id);
            if (!convo) { alert('Transcript not found.'); return; }
            
            document.getElementById('modalTitle').textContent = convo.title || 'Untitled';
            const container = document.getElementById('modalContent');
            container.innerHTML = '';
            
            convo.messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'message ' + msg.role;
                
                const roleDiv = document.createElement('div');
                roleDiv.className = 'message-role';
                const roleLabels = { user: '👤 User', assistant: '🤖 Assistant', system: '⚙️ System' };
                roleDiv.textContent = (roleLabels[msg.role] || msg.role) + (msg.timestamp ? ' • ' + msg.timestamp : '');
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.textContent = msg.content;
                
                div.appendChild(roleDiv);
                div.appendChild(contentDiv);
                container.appendChild(div);
            });
            
            document.getElementById('modalOverlay').classList.add('active');
        }
        
        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }
        
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    </script>
</body>
</html>
"@

$htmlFile = Join-Path $OutputDir "index.html"
$htmlContent | Out-File -FilePath $htmlFile -Encoding UTF8

Write-Host "  HTML index saved to index.html" -ForegroundColor Green

# ============================================================
# Summary
# ============================================================
Write-Host ""
Write-Host "=== Recovery Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output directory: $OutputDir" -ForegroundColor White
Write-Host ""
Write-Host "Files generated:" -ForegroundColor White
Write-Host "  📄 index.html            - Interactive HTML viewer for all conversations" -ForegroundColor Green
Write-Host "  📄 conversations_summary.json - Machine-readable summary of all conversations" -ForegroundColor Green
Write-Host "  📁 transcripts/          - Individual markdown files for conversations with transcripts ($withTranscript files)" -ForegroundColor Green
Write-Host "  📁 media/                - Copied media files (screenshots, images)" -ForegroundColor Green
Write-Host ""
Write-Host "To view, open index.html in your browser:" -ForegroundColor Yellow
Write-Host "  start `"$htmlFile`"" -ForegroundColor Yellow
Write-Host ""
