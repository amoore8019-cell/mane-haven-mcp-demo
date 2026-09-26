import { readFileSync } from 'node:fs';
const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
export const getCatalog = () => catalog;
export function recommend({goal='', currentColor='', desiredColor='', priorColor='', hairCondition='', isExistingClient=false, extensionMethod='', extensionRows=0}={}) {
  const q = [goal,currentColor,desiredColor,priorColor,hairCondition].join(' ').toLowerCase();
  let id=null, reason='More detail is needed to choose a service.';
  if (/extension/.test(q)) {
    if (/move|maintenance|adjust/.test(q) && extensionMethod && [1,2].includes(Number(extensionRows))) {
      id = `${/hidden/i.test(extensionMethod)?'hidden-bead':'traditional-move-up'}-${Number(extensionRows)===1?'one':'two'}`;
      reason='The method and row count match this published maintenance service.';
    } else {id='extension-consultation'; reason='A consultation can establish the right extension plan or identify the existing method and row count.';}
  } else if (/box dye|box color|damage|breakage|correct|uneven|black to blonde|dark to blonde|major.*blond|bleach.*history/.test(q)) {
    id='color-consultation'; reason='Prior color or a major change needs an individual assessment before choosing a color slot.';
  } else if (/gray|grey|sparkle/.test(q)) {id='sparkle-coverage'; reason='The salon lists Sparkle Coverage for gray coverage; it is not a blonding service.';}
  else if (/face.?frame|money piece/.test(q)) {id='face-frame-foil'; reason='A limited brightness boost around the face matches up to 10 face-frame foils.';}
  else if (/highlight|foil|blond|balayage|lighter/.test(q)) {id=isExistingClient?'maintenance-foil':'full-foil'; reason=isExistingClient?'A maintenance foil is listed for returning color clients refreshing highlights.':'Full Foil is the published longer slot for new clients or a broad blonde refresh.';}
  else if (/one color|all over color|solid color|brunette/.test(q)) {id='all-over-color'; reason='The goal sounds like one solid color; this is not a blonding service.';}
  else if (/gloss|brass|tone|shine/.test(q)) {id='gloss-treatment'; reason='A gloss is listed for tone or shine between larger color visits.';}
  else if (/blow.?out|wash.*style|curls/.test(q)) {id=/extension/.test(q)?'blow-out-with-extensions':'blow-out'; reason='A wash and style matches the requested finish.';}
  if (!id && /cut|trim|layers/.test(q)) {id='haircut'; reason='A haircut matches the stated goal if the salon accepts the requested length and technique.';}
  if (id==='haircut' && /above.chin|short pixie|kids|child|clipper|barber/.test(q)) return {service:null,reason:'Mane Haven says it does not accept above-chin, kids, clipper, or barbering cuts. Contact the salon for a referral.',contact_url:catalog.policy.stylist_contact};
  const service=catalog.services.find(s=>s.id===id)??null;
  return {service,reason,booking_url:catalog.booking_url,notice:'Recommendation only. Prices and timing are published menu values; confirm scope and availability in booking. No appointment has been made.', ...(id==='color-consultation'?{listing_note:'The published Color Consultation description refers to extensions. Confirm scope with Mane Haven directly.'}:{})};
}
export function rebooking(serviceId) {
 const service=catalog.services.find(s=>s.id===serviceId);
 if(!service) return {error:'Unknown service ID', available_service_ids:catalog.services.map(s=>s.id)};
 return {service:service.name, illustrative_window_weeks:service.illustrative_rebooking_window_weeks, notice:catalog.rebooking_notice};
}
export function reminder(stage) {
 const link=catalog.booking_url;
 const messages={
  confirmation:'Hi [client], please confirm your Mane Haven appointment on [date] at [time]. If you need to cancel or reschedule, please give at least 24 hours notice. [confirmation method]',
  day_before:'Hi [client], a reminder of your Mane Haven appointment tomorrow, [date] at [time]. For color, please be ready to discuss prior color and your goal. Changes within 24 hours may incur the published 50% cancellation fee. [contact method]',
  unconfirmed:'Hi [client], we have not yet received confirmation for [date] at [time]. Please contact the salon directly to confirm or reschedule. [contact method]',
  missed:'Hi [client], sorry we missed you at your appointment on [date]. Please contact Mane Haven to discuss next steps or rebooking. '+link
 };
 return {stage,draft:messages[stage]??null,notice:messages[stage]?'Demo draft only; no message was sent and no client status was checked.':'Choose confirmation, day_before, unconfirmed, or missed.'};
}
