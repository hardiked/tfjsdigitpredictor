var canvas;
var classNames = [];
var canvas;
var coords = [];
var mousePressed = false;
var mode;
let model;


// $('#downloader').click(async function(e){
//     e.preventDefault();
//     console.log("here");
//     // document.getElementById("downloader").download = "image.png";
//     // document.getElementById("downloader").href = document.getElementById("canvas").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
//     var c=document.getElementById("canvas");
//     var d=c.toDataURL("image/png");
//     var w=window.open('about:blank','image from canvas');
//     w.document.write("<img src='"+d+"' alt='from canvas'/>");
   
// })

$(function() {
    canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 10;
    canvas.renderAll();
    //setup listeners 
    canvas.on('mouse:up', function(e) {
        getFrame();
        mousePressed = false
    });
    canvas.on('mouse:down', function(e) {
        mousePressed = true
    });
    canvas.on('mouse:move', function(e) {
        recordCoor(e)
    });
})

function recordCoor(event) {
    var pointer = canvas.getPointer(event.e);
    var posX = pointer.x;
    var posY = pointer.y;

    if (posX >= 0 && posY >= 0 && mousePressed) {
        coords.push(pointer)
    }
}

function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort(function(a, b) {
                return inp[b] - inp[a];
            }); // descending sort the output array
            outp.pop(); // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
}

function findTopValues(inp, count) {
    var outp = [];
    let indices = findIndicesOfMax(inp, count)
    // show 5 greatest scores
    for (var i = 0; i < indices.length; i++)
        outp[i] = inp[indices[i]]
    return outp
}
function getFrame() {
    //make sure we have at least two recorded coordinates 
    if (coords.length >= 2) {

        //get the image data from the canvas 
        const imgData = getImageData()

        //get the prediction 
        const pred = model.predict(preprocess(imgData)).dataSync()

        //find the top 5 predictions 
        // const indices = findIndicesOfMax(pred, 5)
        // const probs = findTopValues(pred, 5)
        // const names = getClassNames(indices)

        //set the table 
        // setTable(names, probs)
        var max1;
        max1=Math.max(pred[0],pred[1],pred[2],pred[3],pred[4],pred[5],pred[6],pred[7],pred[8],pred[9]);
        console.log(pred.indexOf(max1))
        console.log(pred);
        var div=document.getElementById('result');
        div.innerHTML=pred.indexOf(max1);
    }

}

function getImageData() {
    //get the minimum bounding box around the drawing 
    const mbb = getMinBox()

    //get image data according to dpi 
    const dpi = window.devicePixelRatio
    const imgData = canvas.contextContainer.getImageData(mbb.min.x * dpi, mbb.min.y * dpi,
                                                  (mbb.max.x - mbb.min.x) * dpi, (mbb.max.y - mbb.min.y) * dpi);
    return imgData
}

function getMinBox() {
    //get coordinates 
    var coorX = coords.map(function(p) {
        return p.x
    });
    var coorY = coords.map(function(p) {
        return p.y
    });

    //find top left and bottom right corners 
    var min_coords = {
        x: Math.min.apply(null, coorX),
        y: Math.min.apply(null, coorY)
    }
    var max_coords = {
        x: Math.max.apply(null, coorX),
        y: Math.max.apply(null, coorY)
    }

    //return as strucut 
    return {
        min: min_coords,
        max: max_coords
    }
}

function preprocess(imgData) {
    return tf.tidy(() => {
        //convert to a tensor 
        let tensor = tf.fromPixels(imgData, numChannels = 1)
        
        //resize 
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat()
        
        //normalize 
        const offset = tf.scalar(255.0);
        const normalized = tf.scalar(1.0).sub(resized.div(offset));

        //We add a dimension to get a batch shape 
        const batched = normalized.expandDims(0)
        return batched
    })
}

(async function () {
    model = await tf.loadModel('http://localhost:8080/model/model.json');
    $('.progress-bar').hide();
    const x=await model.predict(tf.zeros([1, 28, 28, 1]))
    // x.argMax().print();
    allowDrawing();
})();

function allowDrawing() {
    canvas.isDrawingMode = 1;
}

function erase() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coords = [];
}

$('#clearButton').click(function(e){
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coords = [];
   
})
