"""
Handle view logic for the XBlock
"""
from __future__ import absolute_import
from xblockutils.resources import ResourceLoader
from xblockutils.studio_editable import StudioEditableXBlockMixin

from django.contrib.auth.models import User
from lms.djangoapps.certificates.helpers import regeneration_request_available, regeneration_in_progress

from .mixins.fragment import XBlockFragmentBuilderMixin


class GradeMeButtonViewMixin(
        XBlockFragmentBuilderMixin,
        StudioEditableXBlockMixin,
):
    """
    Handle view logic for Image Modal XBlock instances
    """

    loader = ResourceLoader(__name__)
    static_js_init = 'GradeMeButtonView'

    def is_anonymous_user(self):
        """
        Check if current user is anonymous
        """
        user_service = self.runtime.service(self, 'user')
        user = user_service.get_current_user()
        email = user.emails[0]
        if 'xblock-workbench.user_id' in user.opt_attrs:
            return False
        if email.endswith('@example.com'):
            return True
        if email.endswith('.example.com'):
            return True
        return False

    def provide_context(self, context=None):
        """
        Build a context dictionary to render the student view
        """
        user_service = self.runtime.service(self, 'user')
        xblock_user = user_service.get_current_user()

        #Check if certificate needs regeneration
        show_regenerate_button = False
        show_regenerate_in_progress = False

        if not self.is_anonymous_user():
            user = User.objects.get(id=xblock_user.opt_attrs['edx-platform.user_id'])
            request_available = regeneration_request_available(user, self.course_id)
            regeneration_in_progress = regeneration_in_progress(user, self.course_id)
        else:
            request_available = False
            regeneration_in_progress = False

        if request_available and not regeneration_in_progress:
            show_regenerate_button = True
        elif regeneration_in_progress:
            show_regenerate_in_progress = True

        context = context or {}
        context.update({
            'display_name': self.display_name,
            'description_text': self.description_text,
            'button_text': self.button_text,
            'is_anonymous_user': self.is_anonymous_user(),

            # Certificate regeneration request button
            'show_regenerate_button': show_regenerate_button,
            'show_regenerate_in_progress': show_regenerate_in_progress,
            'course_id': self.course_id,
        })
        return context
