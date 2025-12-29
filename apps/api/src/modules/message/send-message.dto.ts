import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Nomor WhatsApp tujuan (format 628xxx)',
    example: '6285868474405',
  })
  to: string;

  @ApiProperty({
    description: 'Tipe pesan (text atau image)',
    enum: ['text', 'image'],
    example: 'text',
  })
  type: 'text' | 'image';

  @ApiProperty({
    description: 'Isi pesan teks (Wajib jika type=text)',
    example: 'Halo, ini pesan dari KirimyOS!',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'URL Gambar (Wajib jika type=image)',
    example: 'https://placehold.co/600x400/png',
    required: false,
  })
  url?: string;

  @ApiProperty({
    description: 'Caption untuk gambar',
    example: 'Lihat gambar ini!',
    required: false,
  })
  caption?: string;
}
