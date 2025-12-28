import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express'; // <--- 1. Import tipe Request dari Express

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 2. Kasih tau kalau getRequest() isinya adalah <Request>
    const request = context.switchToHttp().getRequest<Request>();

    // 3. Sekarang akses headers jadi aman
    const apiKey = request.headers['x-api-key'];

    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
      return true;
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException(
        'API Key salah atau tidak ditemukan! Minggir lu!',
      );
    }

    return true;
  }
}
