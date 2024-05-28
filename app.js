const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { EVENTS } = require('@bot-whatsapp/bot')

// Function to call a web API
async function callWebApi(url, message) {
    const serverNumber = "8135531773";

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

const flowPrincipal = addKeyword(['hola'])
    .addAnswer('Buenas, buenas!')

const flowBienvenida = addKeyword(EVENTS.WELCOME)
    .addAction(async(ctx, { flowDynamic }) => {
        console.log('Context Body:', ctx.body)

        const apiResponse = await callWebApi('https://kipcalm.azurewebsites.net/Whatsapp/getWhatsappMessage', ctx.body);

        console.log('Respuesta: ' + JSON.stringify(apiResponse, null, 2));

        return await flowDynamic(`Tu mensaje es: ${ctx.body}`)
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowBienvenida])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
