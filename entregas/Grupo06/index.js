const dotenv = require('dotenv');
const express = require('express');
const app = express();
const { connectToMongoDB, disconnectToMongoDB} = require('./src/mongoDb')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;


/*      MIDDLEWARE      */ 
dotenv.config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});

/*      WEB SERVER      */
app.listen(PORT, () => {
    console.log(`API corriendo en el puerto http://localhost:${PORT}`)
});

/*      ENDPOINTS       */
//Endpoint HOME
app.get("/", (req, res) => {
    res.set("Content-Type", "text/html");
    res.status(200).send("<html><body><h1>Bienvenid@s a HOME</h1></body></html>");
  });

//Endpoint GET para obtener todas las computadoras
app.get("/computadoras", async (req, res) => {
    res.status(501).send("NO IMPLEMENTADO");
});

//Endpoint GET para obtener una computadora por codigo
app.get("/computadoras/:codigo", async (req, res) => {
    res.status(501).send("NO IMPLEMENTADO");
});

//Endpoint GET para obtener todas las computadoras por nombre o descripcion (categoria)
app.get("/computadoras/search/:search", async (req, res) => {
    const search = req.params.search;
    const client = await connectToMongoDB();

    if (!client) {
        res.status(503).send('Error al conectar con la base de datos')
        return;
    }

    const regex = new RegExp(search.toLowerCase(), 'i'); 
    const db = client.db('Grupo06')
    const computadoras = await db.collection('computadoras')
        .find({ $or: [{ nombre: regex }, { categoria: regex }] }).toArray()
    await disconnectToMongoDB()

    computadoras.length == 0 ? res.status(404).send("No se encontraron computadoras con el nombre o categoria "+ search)
        : res.status(200).json(computadoras)
    
});

//Endpoint POST para agregar una computadora
app.post("/computadoras", async (req, res) => {
    res.status(501).send("NO IMPLEMENTADO");
});

//Endpoint PUT para modificar una computadora
app.put("/computadoras/:codigo", async (req, res) => {
    const codigo = req.params.codigo;
    const update = req.body;
    console.log(update);

    if (Object.keys(update).length === 0) {
        res.status(400).send("Falta el cuerpo del mensaje");
        return;
    }

    const client = await connectToMongoDB();
    if (!client) {
        res.status(503).send("Error al conectar con la base de datos");
        return;
    }

    const db = client.db('Grupo06');
    const computadoras = await db.collection('computadoras')
    const computadoraEncontrada = await computadoras.findOne({ codigo: parseInt(codigo) });

    console.log(computadoraEncontrada);
    if (!computadoraEncontrada) {
        res.status(404).send("No se encontro la computadora con codigo "+ codigo);
        return;
    }

    //Incluye solo los campos del objeto que existen en la base de datos
    for (const campos in update) {
        if (!computadoraEncontrada.hasOwnProperty(campos)) {
            res.status(500).send(`Error al actualizar el producto, campo ${campos} no encontrado en la base de datos`)
            return;
        }
    }

    computadoras.updateOne({ codigo: parseInt(codigo) }, { $set: update }).then(() => {
        console.log(`Producto con codigo ${codigo} actualizado correctamente.`)
        res.status(201).send(update);
    }).catch((error) => {
        console.error("Error al actualizar el producto", error)
        res.status(500).send("Error al actualizar el producto")
    }).finally(async () => {
        await disconnectToMongoDB()
    });
});

//Endpoint DELETE para eliminar una computadora 
app.delete("/computadoras/:codigo", async (req, res) => {
    res.status(501).send("NO IMPLEMENTADO");
});


//Endpoint NOT FOUND
app.get("*", (req, res) => {
    res.status(404).json({
      error: "404",
      message: "No se encuentra la ruta solicitada",
    });
  });
  
/*      GLOSARIO DE ERRORES
200 OK: Respuesta estándar para solicitudes correctas.
201 Created: La solicitud ha tenido éxito y se ha creado o autualizado recurso.
400 Bad Request: La solicitud contiene sintaxis incorrecta o no puede procesarse.
404 Not Found: El servidor no pudo encontrar el contenido solicitado.
501 Not Implemented: La solicitud no se ha implementado.
503 Service Unavailable: El servidor no está disponible.
*/