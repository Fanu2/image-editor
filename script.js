$(document).ready(function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let image = new Image();
    let history = [];
    let redoStack = [];

    // Load image from file
    $('#inputImage').on('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            image.src = e.target.result;
            image.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                saveState(); // Save initial state
            };
        };
        reader.readAsDataURL(file);
    });

    // Save state function
    function saveState() {
        history.push(canvas.toDataURL());
        redoStack = []; // Clear redo stack on new action
    }

    // Rotate image
    function rotate(degrees) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
        ctx.restore();
    }

    $('#btnRotateClockwise').on('click', function () {
        rotate(30);
        saveState();
    });

    $('#btnRotateCounterClockwise').on('click', function () {
        rotate(-30);
        saveState();
    });

    // Resize image
    $('#btnResize').on('click', function () {
        const newWidth = parseInt($('#inputWidth').val(), 10);
        const newHeight = parseInt($('#inputHeight').val(), 10);
        if (newWidth > 0 && newHeight > 0) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(image, 0, 0, newWidth, newHeight);
            saveState();
        }
    });

    // Apply filters
    $('#filterSelect').on('change', function () {
        const selectedFilter = $(this).val();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = selectedFilter === 'grayscale' ? 'grayscale(1)' : 
                     selectedFilter === 'sepia' ? 'sepia(1)' : 
                     selectedFilter === 'invert' ? 'invert(1)' : 'none';
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });

    // Flip Image
    $('#btnFlipHorizontal').on('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(-1, 1);
        ctx.drawImage(image, -canvas.width, 0, canvas.width, canvas.height);
        ctx.scale(-1, 1); // Reset scale
        saveState();
    });

    $('#btnFlipVertical').on('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, -canvas.height, canvas.width, canvas.height);
        ctx.scale(1, -1); // Reset scale
        saveState();
    });

    // Add text overlay
    $('#btnAddText').on('click', function () {
        const text = $('#textOverlay').val();
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(text, 50, 50); // Change position as needed
        saveState();
    });

    // Undo/Redo functionality
    $('#btnUndo').on('click', function () {
        if (history.length > 1) {
            redoStack.push(history.pop()); // Move the last state to redo stack
            const previousState = history[history.length - 1];
            const img = new Image();
            img.src = previousState;
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    });

    $('#btnRedo').on('click', function () {
        if (redoStack.length > 0) {
            const redoState = redoStack.pop();
            history.push(redoState); // Push back to history
            const img = new Image();
            img.src = redoState;
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    });

    // Download edited image
    $('#btnDownload').on('click', function () {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});
