import {html} from 'https://unpkg.com/lit-html?module';
import {injectStyle, getActiveBucket} from '../utils.js'
import {bucketSwitcher} from './bucket-switcher.js'
import {bucketEditor} from './bucket-editor.js'
import {bucketDisplay} from './bucket-display.js'
import {Model} from '../model.js'
import {Controller} from '../controller.js'

export function youtubeBuckets() {
  return html`
    <div class="header">
      <h1>
        <img class="logo" src="https://cdn.glitch.com/a03068da-108e-4c2f-8391-31de05066e1d%2Fyoutube-buckets.svg?v=1592058706142">
        <span class="red-underline">YouTube Buckets</span>
      </h1>
      <button class="help-button" @click="${toggleHelp}"><span class="material-icons help-icon">help</span></button>
      ${Model.session.showHelp
        ? html`
          <div class="help-text">
            <p>
              <strong>What?</strong><br>
              This site lets you categorise your YouTube subscriptions into buckets and view each categorised video feed.
            </p>
            <p>
              <strong>Why?</strong><br>
              Too many diverse YouTube subscriptions means having to sift through content to find what you're currently interested in watching.
            </p>
            <p>
              <strong>Legal</strong><br>
              This site is not affiliated with <a href="https://youtube.com" target="_blank">YouTube</a>.<br>
              <a class="help-links" href="/privacy-policy.html">Privacy policy</a>
            </p>
          </div>
        `
        : null
      }
    </div>
    ${Model.session.state.type == 'initialising'
      ? 'Initialising...'
      : Model.session.state.type == 'signin'
        ? 'sign in'
        : html`
          ${bucketSwitcher()}
          ${Model.session.state.editing ? bucketEditor() : bucketDisplay()}
        `
    }
  `;
}

injectStyle(`
.header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
}

.logo {
  height: 40px;
}

h1 {
  user-select: none;
}

.red-underline:hover {
  text-decoration: underline red;
}

.help-button {
  background-color: transparent;
  border-style: none;
  padding: 0;
}

.help-icon {
  display: block;
  font-size: 30px;
  user-select: none;
  color: white;
}

.help-text {
  display: block;
  position: absolute;
  top: 5px;
  right: 55px;
  width: min(calc(100vw - 100px), 400px);
  padding-left: 20px;
  padding-right: 20px;
  background-color: #000d;
  backdrop-filter: blur(3px);
  border-radius: 10px;
  z-index: 1;
}

.help-links {
  color: white;
}
`);

function toggleHelp() {
  Controller.toggleHelp();
}