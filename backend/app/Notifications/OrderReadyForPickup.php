<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderReadyForPickup extends Notification
{
    use Queueable;

    public function __construct(public Order $order)
    {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $shopName = $this->order->shop?->name ?? 'a shop';

        return [
            'type' => 'order_ready_for_pickup',
            'order_id' => $this->order->id,
            'message' => "Order #{$this->order->id} from {$shopName} is ready for pickup.",
        ];
    }
}
