import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog,recommend,reminder,rebooking} from './logic.js';
test('published menu has distinct consultations and real booking handoff',()=>{assert.equal(getCatalog().services.length,16);assert.match(getCatalog().booking_url,/glossgenius.com\/book/);assert.equal(recommend({goal:'dark to blonde after box dye'}).service.id,'color-consultation');});
test('gray coverage and extensions route safely',()=>{assert.equal(recommend({goal:'cover my gray'}).service.id,'sparkle-coverage');assert.equal(recommend({goal:'extension move up',extensionMethod:'hidden bead',extensionRows:2}).service.id,'hidden-bead-two');});
test('reminders and return windows cannot masquerade as actions or policy',()=>{assert.match(reminder('day_before').notice,/no message was sent/);assert.match(rebooking('full-foil').notice,/illustrative/);});
