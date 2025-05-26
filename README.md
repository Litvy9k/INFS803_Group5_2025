hello 

not really a readme just seems more like it this way bruh


Functional backend apis: 

====================USER RELATED:====================

/api/user/register/ - Anyone

/api/user/login/ - Anyone

/api/user/login/refresh/ - Logged in only, for getting new token

/api/user/logout/ - Logged in only, need do provide the refresh token

/api/user/update/ - Logged in only, update email, first/last name, password and avatar

/api/user/current/ - Logged in only, get all info of current user

/api/user/list/ - Logged in only, get a list of all users

/api/user/get/<user_id>/ - Logged in only, get selected user info

====================POST RELATED:====================

/api/main/post/create/ - Logged in and 'is_active = True' (not banned) only

/api/main/post/delete/<post_id>/ - op or moderator only ofc

/api/main/post/edit/<post_id>/ - op or moderator only ofc

/api/main/post/ - Anyone, get all posts

/api/main/post/<post_id>/ - Anyone, get selected post (replies not included)

/api/main/post/upvote/<post_id>/ - Logged in only, 1 upvote each post per user, call this api on already upvoted post to cancel the upvote

/api/main/post/search/?search=<content> - Logged in only, searching title and content

/api/main/post/sorted/?ordering=-upvotes_count&-reply_count&-latest_reply_time - Allow any, remove the - to get ascending order

====================REPLY RELATED:====================

/post/<post_id>/reply/create/ - Logged in and 'is_active = True' (not banned) only, reply to a post

/post/<post_id>/reply/create/<reply_id>/ - Logged in and 'is_active = True' (not banned) only, reply to another reply

/post/<int:post_pk>/reply/ - Anyone, get all replies of a post

/post/reply/delete/<reply_id>/ - op or moderator only, delete a reply

/post/reply/edit/<reply_id>/ - op or moderator only, edit a reply

/post/reply/upvote/<reply_id>/ - Logged in and 'is_active = True' (not banned) only, upvoting a reply. Similar to post upvoting above

also there will be a 405 error in DRF visualized apis but it shouldn't be a problem for frontend