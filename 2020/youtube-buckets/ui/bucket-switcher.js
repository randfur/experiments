import {html} from 'https://unpkg.com/lit-html?module';
import {classMap} from 'https://unpkg.com/lit-html/directives/class-map?module';
import {injectStyle, enterIsClick} from '../utils.js'
import {Controller} from '../controller.js';
import {Model} from '../model.js';

export function bucketSwitcher() {
  const editing = Model.session.state.editing;
  return html`
    <div class="bucket-switcher">
      <button class="edit-button" @click="${toggleEdit}"><span class="material-icons">${editing ? 'view_comfy' : 'edit'}</span>${editing ? 'VIEW' : 'EDIT'}</button>
      ${Model.stored.buckets.map(bucket => {
        const active = bucket.name === Model.session.state.activeBucketName;
        const activeEditing = active && Model.session.state.editing;
        const classes = classMap({
          tab: true,
          active,
        });
        return html`
          <button class="${classes}" style="--color: ${bucket.color}" .bucket="${bucket}" @click="${tabClick}" @keypress="${enterIsClick}" tabIndex="0">
            ${activeEditing ? html`<span class="move-position material-icons" .bucket="${bucket}" @click="${moveLeft}" tabIndex="0">keyboard_arrow_left</span>` : null}
            <div class="tab-name">${bucket.name}</div>
            ${activeEditing ? html`<span class="move-position material-icons" .bucket="${bucket}" @click="${moveRight}" tabIndex="0">keyboard_arrow_right</span>` : null}
          </button>
        `;
      })}
      <button class="tab new-bucket" @click="${newBucket}"><span class="material-icons">add</span></button>
    </div>
  `;
}

injectStyle(`
.bucket-switcher {
  position: sticky;
  top: 0px;
  z-index: 1;
  background: #202020;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
}

.edit-button {
  display: inline-flex;
  align-items: center;

  border-style: none;
  background-color: #fff1;
  color: white;
  border-radius: 4px;
  padding-top: 3px;
  padding-right: 8px;
  margin-right: 15px;
  margin-bottom: 3px;
}

.edit-button:hover {
  border-style: none;
  background-color: #fff3;
}

.edit-button > span.material-icons {
  position: relative;
  top: -1px;
  margin-right: 4px;
}

.tab {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-end;

  height: 30px;
  margin-right: 1px;
  border-style: none;
  border-bottom-style: solid;
  border-radius: 10px 10px 0 0;
  border-color: var(--color);
  background-color: transparent;
  color: var(--color);
  font-size: 18px;
  white-space: nowrap;
}

.tab:hover {
  background-color: #fff3;
  user-select: none;
}

.tab.active {
  background-color: var(--color);
  color: black;
  font-size: 24px;
  font-weight: bold;
  height: 35px;
}

.tab-name {
  padding-left: 20px;
  padding-right: 20px;
}

.move-position {
  font-size: 30px;
  color: #0005;
}

.move-position:hover, .move-position:focus {
  color: #000;
}

.tab.new-bucket:hover, .tab.new-bucket:focus {
  background-color: #444
}
`);

function tabClick(event) {
  let element = event.target;
  while (true) {
    if (!element) {
      console.warn('No bucket found for tab.');
      return;
    }
    if (element.bucket) {
      Controller.switchToBucket(element.bucket.name);
      return;
    }
    element = element.parentElement;
  }
}

function moveLeft(event) {
  Controller.moveLeft();
  event.stopPropagation();
}

function moveRight(event) {
  Controller.moveRight();
  event.stopPropagation();
}

function toggleEdit() {
  Controller.toggleEdit();
}

function newBucket() {
  Controller.newBucket();
}