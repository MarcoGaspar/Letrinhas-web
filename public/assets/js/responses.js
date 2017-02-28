/**
 * Created by Cris on 11/03/2016.
 */

window.sucssesMsg = function (form, txt) {
    var $edit = $("<div>", {
        class: "modal fade",
        tabindex: "-1",
        id: "infoModal",
        role: "dialog",
        "aria-labelledby": "basicModal",
        "aria-hidden": "true"
    }).append('<div id="infoModalContent" class="modal-dialog"></div>');

    $(form).append($edit);

    $('#infoModalContent').html('<div id="popUpAlert" class="alert alert-success">'
        + '<strong>Sucesso!</strong> ' + txt
        + '</div>');
    $('#infoModal').modal("show");
    setTimeout(function () {
        $('#infoModal').modal("hide");
    }, txt.length * 40);

};
window.alertMsg = function (form, txt) {
    var $edit = $("<div>", {
        class: "modal fade",
        tabindex: "-1",
        id: "infoModal",
        role: "dialog",
        "aria-labelledby": "basicModal",
        "aria-hidden": "true"
    }).append('<div id="infoModalContent" class="modal-dialog"></div>');

    $(form).append($edit);

    $('#infoModalContent').html('<div id="popUpAlert" class="alert alert-warning">'
        + '<strong>Atenção!</strong> ' + txt
        + '</div>');
    $('#infoModal').modal("show");
    setTimeout(function () {
        $('#infoModal').modal("hide");
    }, txt.length * 40);

};

window.failMsg = function (form, txt) {
    var $edit = $("<div>", {
        class: "modal fade",
        tabindex: "-1",
        id: "infoModal",
        role: "dialog",
        "aria-labelledby": "basicModal",
        "aria-hidden": "true"
    }).append('<div id="infoModalContent" class="modal-dialog"></div>');

    form.append($edit);

    $('#infoModalContent').html('<div id="popUpAlert" class="alert alert-warning">'
        + '<strong>Ups!</strong> ' + txt
        + '</div>');
    $('#infoModal').modal("show");
    setTimeout(function () {
        $('#infoModal').modal("hide").delay(3000);
    }, txt.length * 50);
};
/**
 *
 * @param title titulo do modal
 * @param content texto de apresentação
 * @param option nome do botao que respodera a um evento
 * @param text  texto do botao
 * @returns {string}    codigo do modal
 */
window.delModal = function (title, content, option, value) {
    $('#modalConfirmDel').remove();
    var code = '' +
            <!-- modal -->
        '<div id="modalConfirmDel" class="modal fade" tabindex="-1" role="dialog">' +
        '    <div class="modal-dialog">' +
        '        <div class="modal-content">' +
        '            <div class="modal-header" style="border-color: #B22222;">' +
        '                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '                    <h4 class="modal-title">' + title + '</h4>' +
        '            </div>' +
        '        <div class="modal-body">' +
        '            <p>' + content + '</p>' +
        '            <p class="infoP" ><b>Atenção</b> : Esta acção não poderá ser revertida.</p>' +
        '        </div>' +
        '        <div class="modal-footer">' +
        '            <button type="button" class="btn btn-default"  data-dismiss="modal">Cancelar</button>' +
        '            <button id="' + option + '" value="' + value + '" type="button" class="btn btn-danger"> Apagar' +
        '               <span class="glyphicon glyphicon glyphicon-trash"></span>' +
        '            </button>' +
        '        </div>' +
        '    </div>' +
        '</div>';

    return code;
};
