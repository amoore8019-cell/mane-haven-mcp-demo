import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import http from 'node:http';
import { getCatalog, recommend, rebooking, reminder } from './logic.js';

function createMcpServer() {
const server = new McpServer({name:'mane-haven-concierge',version:'0.1.0'}, {instructions:'Use Mane Haven tools for published services, prices, hours and booking. Ask relevant hair-history questions before recommending color. All bookings happen on the salon website; this server cannot book or send messages. Rebooking windows and reminder drafts are demo only.'});
const annotation={readOnlyHint:true,openWorldHint:false,destructiveHint:false};
const respond = value => ({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
server.registerTool('list_services',{title:'List Mane Haven services',description:'Read Mane Haven published menu with prices, durations, inclusions and booking link.',inputSchema:{},annotations:annotation},async()=>respond({salon:getCatalog().salon,services:getCatalog().services,booking_url:getCatalog().booking_url,pricing_notice:getCatalog().pricing_notice}));
server.registerTool('get_salon_info',{title:'Get Mane Haven information',description:'Read published hours, address, cancellation policy, contact and booking links.',inputSchema:{},annotations:annotation},async()=>respond({salon:getCatalog().salon,policy:getCatalog().policy,booking_url:getCatalog().booking_url}));
server.registerTool('recommend_service',{title:'Recommend salon service',description:'Match a customer goal and hair history to one listed service; collect prior color for color changes. Returns booking handoff, never books.',inputSchema:{goal:z.string().min(1),currentColor:z.string().optional(),desiredColor:z.string().optional(),priorColor:z.string().optional(),hairCondition:z.string().optional(),isExistingClient:z.boolean().optional(),extensionMethod:z.string().optional(),extensionRows:z.number().int().min(0).max(2).optional()},annotations:annotation},async args=>respond(recommend(args)));
server.registerTool('get_rebooking_guidance',{title:'Get rebooking guidance',description:'Return an explicitly illustrative return interval for a known service; no customer history.',inputSchema:{serviceId:z.string()},annotations:annotation},async({serviceId})=>respond(rebooking(serviceId)));
server.registerTool('draft_appointment_message',{title:'Draft appointment message',description:'Create a demo confirmation, day-before, unconfirmed, or missed appointment draft; does not send anything.',inputSchema:{stage:z.enum(['confirmation','day_before','unconfirmed','missed'])},annotations:annotation},async({stage})=>respond(reminder(stage)));
return server;
}
const port=Number(process.env.PORT||3000);
const httpServer=http.createServer(async(req,res)=>{
 if(req.url==='/.well-known/openai-apps-challenge'){
  res.writeHead(200,{'content-type':'text/plain; charset=utf-8'});
  res.end(process.env.OPENAI_APPS_CHALLENGE || '');
  return;
}if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ok:true}));return;}
 if(req.url!=='/mcp'){res.writeHead(404);res.end('Not found');return;}
 const server=createMcpServer();
 const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
 try {await server.connect(transport); await transport.handleRequest(req,res);} catch(err) {if(!res.headersSent)res.writeHead(500);res.end('MCP request failed');console.error(err);}
});
httpServer.listen(port,()=>console.log(`Mane Haven MCP listening on ${port}`));
