hello 

not really a readme just seems more like it this way bruh


Functional backend apis: 

/api/user/register/

/api/user/login/

/api/user/login/refresh/ - for getting new token up to 7 days

/api/user/logout/ - need do provide the refresh token

/api/user/update/ update email, first/last name, password and avatar

/api/main/post/create/ - create post, login (access token) required

/api/main/post/delete/<post_id>/ - op or moderator only ofc

/api/main/post/edit/<post_id>/ - op or moderator only ofc

/api/main/post/ - get all posts, login (access token) required

/api/main/post/<post_id>/ - get selected post, login (access token) required

also there will be a 405 error in DRF visualized apis but it shouldn't be a problem for frontend