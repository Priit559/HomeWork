
$(document).ready(function () {

    $('input[type="file"]').change(function (e) {
        var fileName = e.target.files[0].name;
        $(this).next('.text-danger').next('#imageName').text('Selected: ' + fileName);
    });
});