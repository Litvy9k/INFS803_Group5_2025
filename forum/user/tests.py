from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

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