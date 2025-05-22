from django.db import models
from django.conf import settings
from django.utils import timezone

#Forum models

#Forum post model with title, content, author, created_at, and upvotes
class ForumPost(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    #author is recorded as the id (primary key) of the user who created the post
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(default=timezone.now)
    upvoted_by  = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='upvoted_posts',
        blank=True,
    )

    @property
    def upvotes(self):
        return self.upvoted_by.count()

    def __str__(self):
        return self.title
    
