$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$output = Join-Path $root 'phan_chia_3_nguoi'
if (Test-Path -LiteralPath $output) { throw "Output already exists: $output" }

$groups = @{
    'Nguoi_1_Tai_khoan_Nen_tang' = New-Object System.Collections.Generic.List[string]
    'Nguoi_2_Phong_Lich' = New-Object System.Collections.Generic.List[string]
    'Nguoi_3_Dat_phong_Thanh_toan' = New-Object System.Collections.Generic.List[string]
}
$files = @(
    Get-Item -LiteralPath (Join-Path $root 'README.md'), (Join-Path $root 'package.json')
    Get-ChildItem -LiteralPath (Join-Path $root 'homestay-frontend'), (Join-Path $root 'homestay-monolith') -Recurse -Force -File |
        Where-Object { $_.FullName -notmatch '[\\/](node_modules|dist|target|uploads)[\\/]' -and $_.Name -ne '.env' }
)

foreach ($file in $files) {
    $relative = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
    $group = $null
    if ($relative -match '^homestay-monolith/src/main/java/vn/homestay/room/' -or
        $relative -match '^homestay-frontend/src/(api/(calendarApi|categoryApi|roomApi|useRooms)\.ts|components/(SearchBox|RoomList|RoomForm|Pagination)\.tsx|pages/(RoomPage|AdminRoomsPage|AdminCalendarPage)\.tsx|types/room\.ts)$' -or
        $relative -match '^homestay-frontend/public/hero-homestay') {
        $group = 'Nguoi_2_Phong_Lich'
    }
    elseif ($relative -match '^homestay-monolith/src/main/java/vn/homestay/booking/' -or
            $relative -match '^homestay-frontend/src/(api/(bookingApi|paymentSettingsApi|notificationApi)\.ts|pages/(BookRoomPage|MyBookingsPage|AdminBookingsPage|AdminPaymentSettingsPage|NotificationsPage)\.tsx|types/booking\.ts)$') {
        $group = 'Nguoi_3_Dat_phong_Thanh_toan'
    }
    elseif ($relative -in @('README.md', 'package.json') -or
            $relative -match '^homestay-monolith/(src/main/java/vn/homestay/(account|apikey|shared)/|src/main/java/vn/homestay/HomestayApplication\.java$|src/test/|src/main/resources/|\.mvn/|mvnw|pom\.xml$|README\.md$|\.gitignore$)' -or
            $relative -match '^homestay-frontend/(src/(api/(authApi|apiKeyApi|userApi|axiosClient)\.ts|components/(ProtectedRoute|Navbar|Toast)\.tsx|pages/(LoginPage|RegisterPage|AdminUsersPage|ApiKeysPage)\.tsx|types/(auth|apiKey|apiError)\.ts|contexts/|hooks/|App\.tsx$|main\.tsx$|index\.css$)|public/(login-homestay\.png|favicon\.svg)$|README\.md$|package(-lock)?\.json$|index\.html$|vite\.config\.ts$|tsconfig.*\.json$|\.gitignore$|\.oxlintrc\.json$)') {
        $group = 'Nguoi_1_Tai_khoan_Nen_tang'
    }
    if (-not $group) { throw "Unassigned source file: $relative" }
    $groups[$group].Add($relative)
}

New-Item -ItemType Directory -Path $output | Out-Null
foreach ($group in ($groups.Keys | Sort-Object)) {
    $stage = Join-Path $output $group
    New-Item -ItemType Directory -Path $stage | Out-Null
    foreach ($relative in ($groups[$group] | Sort-Object)) {
        $destination = Join-Path $stage $relative
        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $root $relative) -Destination $destination
    }
    $description = switch ($group) {
        'Nguoi_1_Tai_khoan_Nen_tang' { 'Tài khoản, phân quyền, API Key, cấu hình và ghép ứng dụng.' }
        'Nguoi_2_Phong_Lich' { 'Loại phòng, phòng, tìm kiếm, hình ảnh và lịch bảo trì.' }
        'Nguoi_3_Dat_phong_Thanh_toan' { 'Đặt phòng, thanh toán, hoàn tiền và thông báo.' }
    }
    $manifest = @(
        "# $group"
        ''
        "Phạm vi được giao: $description"
        ''
        'Đây là bản tách theo chức năng để phân công và gửi file, không phải bằng chứng về người đã viết mã nguồn trước đó.'
        'Giữ nguyên đường dẫn khi ghép 3 phần. Mỗi phần riêng lẻ không chạy độc lập.'
        'File .env, thư viện đã cài, file build và ảnh tải lên lúc chạy không được đóng gói.'
        ''
        "Số file gốc: $($groups[$group].Count)"
        ''
        '## Danh sách file'
        ''
    ) + @($groups[$group] | Sort-Object | ForEach-Object { "- ``$_``" })
    Set-Content -LiteralPath (Join-Path $stage 'DANH_SACH_FILE.md') -Value $manifest -Encoding utf8
    $zip = Join-Path $output "$group.zip"
    [System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip, [System.IO.Compression.CompressionLevel]::Optimal, $false)
    Write-Output "$group : $($groups[$group].Count) source files -> $zip"
}

$allAssigned = @($groups.Values | ForEach-Object { $_ })
if ($allAssigned.Count -ne $files.Count -or @($allAssigned | Sort-Object -Unique).Count -ne $files.Count) {
    throw 'Source files were omitted or assigned more than once.'
}
Write-Output "TOTAL: $($files.Count) source files, assigned exactly once."
