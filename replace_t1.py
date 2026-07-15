#!/usr/bin/env python3
"""
Replace T1 function body in PortfolioVOS.jsx with Hyper Charts version
from LifeStack_T1_HyperDetail_v2.jsx reference.

Approach:
1. Extract helpers, data, and zone content from reference
2. Translate P tokens → T tokens
3. Build new T1 function body
4. Splice into PortfolioVOS.jsx replacing old T1
5. Verify bracket balance
"""

import re
import os

os.chdir('/home/user/lifestack-finance')


def translate_tokens(text):
    """Replace P.xxx tokens with T.xxx equivalents."""
    # Longer names first to prevent partial matches
    replacements = [
        ('P.emerald', 'T.emerald'),
        ('P.hShadow', 'T.hShadow'),
        ('P.shadow', 'T.shadow'),
        ('P.violet', 'T.violet'),
        ('P.teal', 'T.teal'),
        ('P.coral', 'T.coral'),
        ('P.amber', 'T.amber'),
        ('P.blue', 'T.blue'),
        ('P.pink', 'T.pink'),
        ('P.glass', 'T.glass'),
        ('P.grid', 'T.grid'),
        ('P.mono', 'T.mono'),
        ('P.sans', 'T.sans'),
        ('P.sky', 'T.sky'),
        ('P.t1', 'T.t1'),
        ('P.t2', 'T.t2'),
        ('P.t3', 'T.t3'),
        ('P.bg', 'T.bg'),
        ('P.gap', 'T.glassGap'),
        ('P.pad', '20'),
        ('P.border', '"rgba(255,255,255,0.08)"'),
    ]
    for old, new in replacements:
        text = text.replace(old, new)

    # P.r → T.glassRadius (word boundary to avoid P.red, P.radius, etc.)
    text = re.sub(r'\bP\.r\b', 'T.glassRadius', text)

    return text


# === READ FILES ===
print("Reading files...")
with open('components/PortfolioVOS.jsx', 'r') as f:
    vos = f.read()

with open('LifeStack_T1_HyperDetail_v2.jsx', 'r') as f:
    ref = f.read()

ref_lines = ref.split('\n')
print(f"  PortfolioVOS.jsx: {len(vos)} chars")
print(f"  Reference: {len(ref_lines)} lines")

# === EXTRACT SECTIONS FROM REFERENCE ===
# Helper components: lines 20-89 (1-indexed) → 0-indexed [19:89]
helpers_raw = '\n'.join(ref_lines[19:89])

# Data arrays: lines 91-116 (1-indexed) → 0-indexed [90:116]
data_raw = '\n'.join(ref_lines[90:116])

# Zone content: lines 145-471 (1-indexed) → 0-indexed [144:471]
zones_raw = '\n'.join(ref_lines[144:471])

print(f"  Helpers: {helpers_raw.count(chr(10))+1} lines")
print(f"  Data: {data_raw.count(chr(10))+1} lines")
print(f"  Zones: {zones_raw.count(chr(10))+1} lines")

# === TRANSLATE P → T TOKENS ===
print("\nTranslating P → T tokens...")
helpers = translate_tokens(helpers_raw)
data = translate_tokens(data_raw)
zones = translate_tokens(zones_raw)

# Verify no remaining P. references in translated content
remaining = set(re.findall(r'\bP\.\w+', helpers + data + zones))
if remaining:
    print(f"  WARNING: Remaining P. refs: {remaining}")
else:
    print("  All P. references translated ✓")

# === BUILD NEW T1 FUNCTION ===
print("\nBuilding new T1 function body...")

new_t1 = '''const T1=()=>{

''' + helpers + '''

''' + data + '''

  return(<div style={{minHeight:"100vh",fontFamily:T.sans,WebkitFontSmoothing:"antialiased",
    background:`radial-gradient(ellipse at 20% 50%,rgba(56,89,160,0.08),transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(120,50,160,0.06),transparent 50%),linear-gradient(180deg,${T.bg} 0%,${T.bg} 100%)`,
    position:"relative",overflow:"hidden"}}>

    {/* Ambient gradient orbs */}
    <div style={{position:"fixed",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,166,35,0.06),transparent 70%)",top:"-10%",left:"65%",filter:"blur(80px)",pointerEvents:"none"}}/>
    <div style={{position:"fixed",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,170,0.04),transparent 70%)",top:"60%",left:"-5%",filter:"blur(80px)",pointerEvents:"none"}}/>

    <div style={{padding:"20px 20px 60px",maxWidth:1400,margin:"0 auto",display:"flex",flexDirection:"column",gap:T.glassGap,position:"relative",zIndex:1}}>

''' + zones + '''

    </div>
  </div>);
};
'''

print(f"  New T1: {new_t1.count(chr(10))+1} lines")

# === SPLICE INTO PORTFOLIOVOS.JSX ===
print("\nSplicing into PortfolioVOS.jsx...")

t1_marker = 'const T1=()=>{'
t2_marker = '// =========================================================================\n// TAB 2'

t1_pos = vos.index(t1_marker)
t2_pos = vos.index(t2_marker)

print(f"  T1 starts at char {t1_pos}")
print(f"  TAB 2 marker at char {t2_pos}")
print(f"  Replacing {t2_pos - t1_pos} chars of old T1")

new_vos = vos[:t1_pos] + new_t1 + '\n\n\n' + vos[t2_pos:]

# === WRITE RESULT ===
with open('components/PortfolioVOS.jsx', 'w') as f:
    f.write(new_vos)

print(f"  Written: {len(new_vos)} chars")

# === VERIFICATION ===
print("\n=== VERIFICATION ===")

t1_count = new_vos.count('const T1=()=>{')
t2_count = new_vos.count('const T2 =')
print(f"  T1 definitions: {t1_count} (expected: 1)")
print(f"  T2 definitions: {t2_count} (expected: 1)")

braces = new_vos.count('{') - new_vos.count('}')
parens = new_vos.count('(') - new_vos.count(')')
brackets = new_vos.count('[') - new_vos.count(']')
print(f"  Braces:   {braces} (target: 0)")
print(f"  Parens:   {parens} (target: 7)")
print(f"  Brackets: {brackets} (target: 0)")

# Check for remaining P. in the T1 region only
new_t1_in_file = new_vos[new_vos.index('const T1=()=>{'):new_vos.index(t2_marker)]
remaining_in_t1 = set(re.findall(r'\bP\.\w+', new_t1_in_file))
if remaining_in_t1:
    print(f"  WARNING: Remaining P. refs in T1 region: {remaining_in_t1}")
else:
    print("  No P. references in T1 region ✓")

print("\n✓ T1 replacement complete!")
