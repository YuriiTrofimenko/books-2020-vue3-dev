// функция подавления эффекта асинхронности
// записи изображения в объект Image
function loadImage(base64) {
  /*
   * We are going to return a Promise which, when we .then
   * will give us an Image that should be fully loaded
   */
  return new Promise(resolve => {
    /*
     * Create the image that we are going to use to
     * to hold the resource
     */
    const image = new Image();
    /*
     * The Image API deals in even listeners and callbacks
     * we attach a listener for the "load" event which fires
     * when the Image has finished the network request and
     * populated the Image with data
     */
    image.addEventListener('load', () => {
      /*
       * You have to manually tell the Promise that you are
       * done dealing with asynchronous stuff and you are ready
       * for it to give anything that attached a callback
       * through .then a realized value.  We do that by calling
       * resolve and passing it the realized value
       */
      resolve(image);
    });
    /*
     * Setting the Image.src is what starts the networking process
     * to populate an image.  After you set it, the browser fires
     * a request to get the resource.  We attached a load listener
     * which will be called once the request finishes and we have
     * image data
     */
    image.src = base64
  });
}

// безымянная функция, экспортируемая как состаляющая модуля по умолчанию
// (при помощи объектов Image и canvas задает изображению желаемые ограничения ширины и высоты)
module.exports = async function(base64, maxWidth, maxHeight){

  // Max size for thumbnail
  if(typeof(maxWidth) === 'undefined')  maxWidth = 300
  if(typeof(maxHeight) === 'undefined')  maxHeight = 300

  // Create and initialize two canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const canvasCopy = document.createElement("canvas");
  const copyContext = canvasCopy.getContext("2d");

  // Create original image
  const img = await loadImage(base64)
  
  // Determine new ratio based on max size
  let ratio = 1;
  if(img.width > maxWidth)
    ratio = maxWidth / img.width;
  else if(img.height > maxHeight)
    ratio = maxHeight / img.height;

  // Draw original image in second canvas
  canvasCopy.width = img.width;
  canvasCopy.height = img.height;
  copyContext.drawImage(img, 0, 0);

  // Copy and resize second canvas to first canvas
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
}