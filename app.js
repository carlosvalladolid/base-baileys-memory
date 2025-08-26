const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { EVENTS } = require('@bot-whatsapp/bot')

const serverNumber = "8124247504";

// Function to call a web API
async function callWebApi(url, message) {
    try {
        const { default: fetch } = await import('node-fetch');
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, serverNumber })
        };
  
        const response = await fetch(url, options);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Failed to fetch data from API:', error);
        return null;
    }
}

const flowPrincipal = addKeyword(['Estatus'])
    .addAnswer('Corriendo...')

const flowStatus = addKeyword(['Hola 8124247504'])
    .addAnswer('SI-' + serverNumber)

//const flowBienvenida = addKeyword(EVENTS.WELCOME)
const flowBienvenida = addKeyword(EVENTS.WELCOME, { sensitive: true })
    .addAction(async(ctx, { flowDynamic }) => {
        console.log('Context Body:', ctx.body)

        // Validar si contiene el texto "911-USAMEX"
        if (!ctx.body.includes("911-USAMEX")) {
            return; // Sale de la función sin hacer nada más
        }

        const apiResponse = await callWebApi('https://kipcalm.azurewebsites.net/Whatsapp/getWhatsappMessage', ctx.body);

        console.log('Respuesta: ' + JSON.stringify(apiResponse, null, 2));

        // Responder algo al mensaje de Carbyne para que no se bloquee el chat
        return await flowDynamic(`Tu mensaje es: ${ctx.body}`)
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowBienvenida, flowStatus])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
