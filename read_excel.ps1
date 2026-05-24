
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open('C:\Gemini_CLI\Chart of account.xlsx')
$ws = $wb.Sheets.Item(1)
$range = $ws.UsedRange
$data = $range.Value2
$wb.Close($false)
$excel.Quit()

$rowCount = $data.GetUpperBound(0)
$colCount = $data.GetUpperBound(1)

$rows = @()
for ($i = 1; $i -le $rowCount; $i++) {
    $row = @()
    for ($j = 1; $j -le $colCount; $j++) {
        $row += $data[$i, $j]
    }
    $rows += ,$row
}

$rows | ConvertTo-Json -Depth 10
