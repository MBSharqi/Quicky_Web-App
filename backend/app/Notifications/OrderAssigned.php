<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderAssigned extends Notification
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
        return [
            'type' => 'order_assigned',
            'order_id' => $this->order->id,
            'message' => "Order #{$this->order->id} has been assigned to a rider.",
        ];
    }
}
