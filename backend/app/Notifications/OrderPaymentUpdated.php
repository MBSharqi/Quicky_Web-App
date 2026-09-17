<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPaymentUpdated extends Notification
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
        $amount = number_format((float) ($this->order->total ?? $this->order->delivery_fee), 2);

        return [
            'type' => 'order_payment_updated',
            'order_id' => $this->order->id,
            'payment_status' => $this->order->payment_status->value,
            'message' => "Order #{$this->order->id} COD marked paid ({$amount}).",
        ];
    }
}
