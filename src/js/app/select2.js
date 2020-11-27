import $ from 'jquery';
import select2 from 'select2';

$(function() {
    $('#options').select2({
        language: 'ru',
        allowClear: true,
        multiple: false,
        placeholder: 'Select2 placeholder....'
    });
});    