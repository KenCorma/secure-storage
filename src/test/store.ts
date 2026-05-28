import { JSDOM } from 'jsdom';
import { changeWindow, Store } from '../utils/store';
import { mainConfig, configure } from '../utils/config';

var window = new JSDOM('<!DOCTYPE html><p>Hello</p>', {
  url: 'http://localhost',
}).window;
changeWindow(window);

import { encrypt, decrypt } from '../utils/crypt';

const separator = '----------------------------------------------------------------------------';
const dots = '..........................................................................';

console.log('Testing configuration', dots, '\n');
console.log('Prev :', mainConfig);
configure({ secret: 'abcdef123', prefix: '_prefix' });
console.log('After :', mainConfig, '\n\n');

console.log(separator, '\n');

// Storage tests
const localStorage = new Store('local');
const sessionStorage = new Store('session');
const stores: Store<any>[] = [localStorage, sessionStorage];
const data = { message: 'test' };

for (let index = 0; index < stores.length; index++) {
  const store = stores[index];

  const mod = store.modifyDataToString(data) as string;
  const enc = encrypt(mod);
  const dec = decrypt(enc as string);
  const decoded = store.getDataFromModifiedString(dec as string);
  console.log('1. Testing store encryption and decryption', dots, '\n');
  console.log('Data :', mod);
  console.log('Encrypted :', enc);
  console.log('Decrypted :', dec);
  console.log('Decoded data :', decoded?.data);
  console.log('Result: Success ✅');

  console.log('\n\n', separator, '\n');
}

console.log('2. Testing storage', dots, '\n');
localStorage.setItem('test', data);
sessionStorage.setItem('test', data);
console.log('Encrypted on local storage :', window.localStorage.getItem(localStorage.getModKey('test')));
console.log('Encrypted on session storage :', window.sessionStorage.getItem(sessionStorage.getModKey('test')));
console.log('Decrypted-decoded Data from local storage :', localStorage.getItem('test'));
console.log('Decrypted-decoded Data from session storage :', sessionStorage.getItem('test'));
console.log('Result: Success ✅');
