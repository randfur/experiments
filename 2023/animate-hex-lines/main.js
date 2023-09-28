import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js'

async function main() {
  const {width, height, hexLinesContext} = HexLinesContext.setupFullPageContext();
  const animation = new Animation();
  const editorState = new EditorState(animation);

  while (true) {
    await new Promise(requestAnimationFrame);
    editorState.render(width, height, hexLinesContext);
  }
}

main();