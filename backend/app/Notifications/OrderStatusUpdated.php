<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification
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
        $status = str_replace('_', ' ', $this->order->status->value);

        return [
            'type' => 'order_status_updated',
            'order_id' => $this->order->id,
            'status' => $this->order->status->value,
            'message' => "Order #{$this->order->id} status updated to {$status}.",
        ];
    }
}
