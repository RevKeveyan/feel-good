$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class SupabaseCliCredResetUsers {
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
  [DllImport("advapi32.dll", SetLastError=true)]
  public static extern bool CredFree(IntPtr cred);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL {
    public int Flags;
    public int Type;
    public IntPtr TargetName;
    public IntPtr Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public int CredentialBlobSize;
    public IntPtr CredentialBlob;
    public int Persist;
    public int AttributeCount;
    public IntPtr Attributes;
    public IntPtr TargetAlias;
    public IntPtr UserName;
  }
  public static string Read(string target) {
    IntPtr p;
    if (!CredRead(target, 1, 0, out p)) return "";
    try {
      var c = (CREDENTIAL)Marshal.PtrToStructure(p, typeof(CREDENTIAL));
      byte[] b = new byte[c.CredentialBlobSize];
      Marshal.Copy(c.CredentialBlob, b, 0, c.CredentialBlobSize);
      return Encoding.UTF8.GetString(b);
    } finally {
      CredFree(p);
    }
  }
}
"@

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  $env:SUPABASE_ACCESS_TOKEN = [SupabaseCliCredResetUsers]::Read("Supabase CLI:supabase")
}

if (-not $env:SUPABASE_ACCESS_TOKEN -or -not $env:SUPABASE_ACCESS_TOKEN.StartsWith("sbp_")) {
  Write-Error "No SUPABASE_ACCESS_TOKEN. Run: npx supabase login"
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
& npm.cmd exec --yes -- tsx (Join-Path $PSScriptRoot "reset-users-and-seed.mjs")
$code = $LASTEXITCODE
Remove-Item Env:SUPABASE_ACCESS_TOKEN -ErrorAction SilentlyContinue
exit $code
