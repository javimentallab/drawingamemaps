// Se inyecta al empezar a cargar la página (solo en webs donde el usuario lo ha pedido) para que
// el navegador no deje de anotar recursos a las 250 entradas: así drawingamemaps ve también las
// imágenes del mapa que se cargaron al principio.
try { performance.setResourceTimingBufferSize(50000); } catch {}
