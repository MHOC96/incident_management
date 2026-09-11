from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from apps.common.choices import AccountStatus

User = get_user_model()


def account_is_allowed(user) -> bool:
    return bool(user and user.is_active and user.status == AccountStatus.ACTIVE)


class ActiveAccountTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.token_class(attrs["refresh"])
        user = User.objects.filter(pk=refresh.payload.get("user_id")).first()
        if not account_is_allowed(user):
            raise InvalidToken("This account is not active.")
        return data
