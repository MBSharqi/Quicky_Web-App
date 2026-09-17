<?php

namespace App\Enums;

enum Role: string
{
    case Customer = 'customer';
    case Rider = 'rider';
    case Admin = 'admin';
    case Shop = 'shop';
}
