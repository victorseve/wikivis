var PenModule = (function(props) {

    let { canvas, color, radius } = props;
    let ctx = canvas.getContext('2d');

    color = color || {value: 'black'};  radius = radius || {value: 2};
    let path = null, paths = [];
    let active = false, erase = false;

    function isActive() { return active }
    function isEraser() { return erase }

    function toggleEraser() {
      return erase = !erase
    }

    function toggle() {
      isActive() ? desactivate() : activate();
    }
    
    function activate() {
      canvas.addEventListener('mousedown', startDrawing)
      canvas.addEventListener('mouseup', endDrawing)
      active = true
      canvas.style.zIndex = 100
    }
    function desactivate() {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mouseup', endDrawing)
      active = false
      canvas.style.zIndex = -100
    }

    function startDrawing() {
      ctx.strokeStyle = color.value;
      ctx.lineWidth = radius.value;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.globalCompositeOperation = isEraser() ? 'destination-out' : 'source-over';
      path = new Path2D();
      canvas.addEventListener('mousemove', draw)
    }
    function endDrawing() {
      canvas.removeEventListener('mousemove', draw)
      paths.push(path)
    }

    function updateCanvas() {
        for (let npath of paths) {
            ctx.stroke(npath)
        }
    }

    function draw(e) {
      let coords = mouseCoordinates(e)
      path.lineTo(...Object.values(coords));
      ctx.stroke(path);
    }

    function mouseCoordinates(e) {
      const offsetX = canvas.getBoundingClientRect().x;
      const offsetY = canvas.getBoundingClientRect().y;
      const mouseX = parseInt(e.clientX - offsetX);
      const mouseY = parseInt(e.clientY - offsetY);
      return {x: mouseX, y: mouseY}
    }

    function transformContext(view) {
      ctx.setTransform(1,0,0,1,0,0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.translate(...Object.values(view.translation))
      ctx.scale(view.scale, view.scale);
      updateCanvas()
    }

    return {
      activate: activate,
      desactivate: desactivate,
      isActive: isActive,
      toggle: toggle,
      toggleEraser: toggleEraser,
      transformContext: transformContext
    }
  })

  module.exports = {
      penTool: PenModule
  }