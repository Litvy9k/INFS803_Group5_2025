from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class AuthFlowTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url    = reverse('token_obtain_pair')
        self.refresh_url  = reverse('token_refresh')
        self.logout_url   = reverse('token_logout')

        self.user_data = {
            'username': 'alice',
            'password': 'secret123',
            'nickname': 'guten_tag'
        }

    def test_register(self):
        resp = self.client.post(
            self.register_url,
            data=self.user_data,
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('username', resp.data)
        self.assertNotIn('password', resp.data)

    def test_login(self):

        self.client.post(self.register_url, data=self.user_data, format='json')

        resp = self.client.post(
            self.login_url,
            data={
                'username': self.user_data['username'],
                'password': self.user_data['password']
            },
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

        self.access = resp.data['access']
        self.refresh = resp.data['refresh']

    def test_logout(self):
        self.client.post(self.register_url, data=self.user_data, format='json')
        login_resp = self.client.post(
            self.login_url,
            data={
                'username': self.user_data['username'],
                'password': self.user_data['password']
            },
            format='json'
        )
        access = login_resp.data['access']
        refresh = login_resp.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

        logout_resp = self.client.post(
            self.logout_url,
            data={ 'refresh': refresh },
            format='json'
        )

        self.assertEqual(logout_resp.status_code, status.HTTP_205_RESET_CONTENT)

        self.client.credentials()
        refresh_resp = self.client.post(
            self.refresh_url,
            data={ 'refresh': refresh },
            format='json'
        )

        self.assertEqual(refresh_resp.status_code, status.HTTP_401_UNAUTHORIZED)

class UserUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='alice',
            password='Secret123!',
            email='alice@example.com',
            first_name='Alice',
            last_name='Liddell'
        )
        login_url = reverse('token_obtain_pair')
        resp = self.client.post(
            login_url,
            {'username': 'alice', 'password': 'Secret123!'},
            format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.access = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access}')
        self.profile_url = reverse('user-update')

    def test_profile_update_returns_before_and_after(self):
        resp_before = self.client.get(self.profile_url, format='json')
        self.assertEqual(resp_before.status_code, status.HTTP_200_OK)
        before_data = resp_before.data
        print('-'*100)
        print(before_data)
        print('-'*100)

        update_payload = {
            'first_name': 'Alicia',
            'last_name': 'Liddle',
            'email': 'alicia@example.org',
        }
        resp_update = self.client.patch(
            self.profile_url,
            data=update_payload,
            format='json'
        )
        self.assertEqual(resp_update.status_code, status.HTTP_200_OK)
        after_data = resp_update.data
        print('-'*100)
        print(after_data)
        print('-'*100)

    def test_profile_update_with_avatar(self):
        initial_avatar_url = self.user.avatar.url if self.user.avatar else ''
        print(initial_avatar_url)
        self.assertIn('default.png', initial_avatar_url)

        image_content = (
            b'GIF87a\x01\x00\x01\x00\x80\x00\x00\x00\x00'
            b'\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,'
            b'\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02'
            b'D\x01\x00;'
        )

        avatar_file = SimpleUploadedFile(
            name='avatar.gif',
            content=image_content,
            content_type='image/gif'
        )

        resp = self.client.patch(
            self.profile_url,
            data={'avatar': avatar_file},
            format='multipart'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


        self.user.refresh_from_db()
        new_avatar_url = self.user.avatar.url

        print(resp.data)
        print(new_avatar_url)