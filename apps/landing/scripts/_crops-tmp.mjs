import sharp from 'sharp'
const sp = 'C:/Users/gabfe/AppData/Local/Temp/claude/d--plataforma-solarbuy-side/988a51d1-15f9-45c6-a871-2ae3713d806d/scratchpad'
for (const [nome, y] of [['top', 166], ['bot', 16550]]) {
  for (const dir of ['baseline', 'novo2']) {
    await sharp(`${sp}/${dir}/um-desktop-semjs.png`)
      .extract({ left: 385, top: y - 40, width: 160, height: 80 })
      .resize(480, 240, { kernel: 'nearest' })
      .png()
      .toFile(`${sp}/crop-${nome}-${dir}.png`)
  }
}
console.log('ok')
