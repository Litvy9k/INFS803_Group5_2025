import os
import uuid
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import default_storage
from django.db import models
from django.utils import timezone

def avatar_upload_to(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    folder = f"avatar/{instance.username}"

    while True:
        name = uuid.uuid4().hex + ext
        path = f"{folder}/{name}"
        if not default_storage.exists(path):
            return path
        


class User(AbstractUser):
    # The AbstractUser class already have some basic attrs afaik
    # username/password/date_joined/last_login/is_superuser/first_name&last_name(optional)
    # email(optional)/is_staff(for django admin)/is_active(optional, can be used to ban user)


    nickname = models.CharField(
        max_length=30,
        unique=True,
        blank=False,
        help_text="User's display name."
    )

    avatar = models.ImageField(
        upload_to=avatar_upload_to,
        default='avatar/default.png',
        help_text="User's profile picture."
        # Some validation here, file extension/size etc.
    )

    bio = models.TextField(
        blank=True,
        help_text="Self introduction or daily thoughts."
    )

    reputation = models.IntegerField(
        default=0,
        help_text="" # For ranking or user group or whatever, optional
    )