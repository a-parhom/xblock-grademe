/* eslint-disable no-unused-vars */
/**
 * Initialize the student view
 * @param {Object} runtime - The XBlock JS Runtime
 * @param {Object} element - The containing DOM element for this instance of the XBlock
 * @returns {undefined} nothing
 */
function GradeMeButtonView(runtime, element) {
    /* eslint-enable no-unused-vars */
    'use strict';

    var $ = window.jQuery;
    var $element = $(element);
    /* eslint-disable camelcase */
    /* eslint-disable no-undef */
    var courseId = window.$$course_id || '';
    /* eslint-enable camelcase */
    /* eslint-enable no-undef */
    var $message = $element.find('.grademebutton_block .verify-button-message-text');

    /**
     * Handle AJAX handler response
     * @returns {undefined} nothing
     */
    function onError() {
        $message
            .text('Please try again.')
            .addClass('error')
            .show();
    }

    /**
     * Handle AJAX handler response
     * @returns {undefined} nothing
     */
    function onSuccess() {
        $message.show();
    }

    $element.find('.grademebutton_block .user_verify_button').on('click', function() {
        $message.hide();
        /* eslint-disable camelcase */
        $.ajax({
            type: 'POST',
            url: '/request_certificate',
            data: {
                course_id: courseId,
            }, // TODO: switch this to the Course Service when available
            error: onError,
            success: onSuccess,
        });
        /* eslint-enable camelcase */
    });

    //Certificate regeneration
    $element.find(".grademebutton_block a.request_regeneration").click( function(event) {
        var element = $(event.target);
        var do_request = confirm("Ви маєте 2 спроби на перегенерацію, пов'язану зі змінами у прізвищі, імені або по батькові. На перегенерацію через набір додаткових балів кількість спроб необмежена. Продовжити?");
        if(!do_request) {
            return false;
        }
        var post_url = $('div.cert_regeneration').data('endpoint');
        $.ajax({
            type: "POST",
            url: post_url,
            data: {'course_id': element.data("course-id")},
            success: function(data) {
                if(data.success) {
                    element.parent("div").html('<span class="regeneration_in_progress_message">Сертифікат в черзі перегенерації</span>');
                }
            },
            error: function(xhr) {
                if (xhr.status === 403) {
                    location.href = "/";
                }
            }
        });
        return false;
    });
    $element.find(".grademebutton_block a.cert_regen_hint_toggle i").click( function(event) {
        var element = $(event.target);
        if (element.parent("a").next(".cert_regen_hint").hasClass("hidden"))
            element.parent("a").next(".cert_regen_hint").removeClass("hidden");
        else
            element.parent("a").next(".cert_regen_hint").addClass("hidden");
        return false;
    });
}
