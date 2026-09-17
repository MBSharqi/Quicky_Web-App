<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCreated extends Notification
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
        $message = $this->order->isShopOrder()
            ? "New shop order #{$this->order->id} is waiting for acceptance."
            : "New order #{$this->order->id} is waiting for assignment.";

        return [
            'type' => 'order_created',
            'order_id' => $this->order->id,
            'message' => $message,
        ];
    }
}
