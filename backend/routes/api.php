<?php

use App\Enums\Role;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\OverviewController as AdminOverviewController;
use App\Http\Controllers\Api\Admin\PageController as AdminPageController;
use App\Http\Controllers\Api\Admin\RiderController as AdminRiderController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\ShopController as AdminShopController;
use App\Http\Controllers\Api\CmsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GeocodeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PublicShopController;
use App\Http\Controllers\Api\Shop\MenuItemController;
use App\Http\Controllers\Api\Shop\OrderController as ShopOrderController;
use App\Http\Controllers\Api\ShopProfileController;
use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/shops', [PublicShopController::class, 'index']);
Route::get('/shops/{slug}', [PublicShopController::class, 'show']);
Route::get('/cms', CmsController::class);
Route::get('/pages/{slug}', [CmsController::class, 'showPage']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', DashboardController::class);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/riders', function () {
        abort_unless(auth()->user()->role === Role::Admin, 403);

        return User::query()
            ->where('role', Role::Rider)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    });

    Route::get('/geocode', GeocodeController::class);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('overview', AdminOverviewController::class);
        Route::get('live-orders', [AdminOverviewController::class, 'live']);
        Route::get('customers', [AdminCustomerController::class, 'index']);
        Route::get('customers/{customer}', [AdminCustomerController::class, 'show']);
        Route::get('cms/settings', [AdminSettingController::class, 'show']);
        Route::put('cms/settings', [AdminSettingController::class, 'update']);
        Route::apiResource('cms/banners', AdminBannerController::class);
        Route::apiResource('cms/pages', AdminPageController::class);
        Route::apiResource('shops', AdminShopController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('riders', AdminRiderController::class)->only(['index', 'store', 'show', 'update']);
    });

    Route::middleware('role:shop')->prefix('shop')->group(function () {
        Route::get('/', [ShopProfileController::class, 'show']);
        Route::patch('/status', [ShopProfileController::class, 'updateStatus']);

        Route::apiResource('menu-items', MenuItemController::class);
        Route::patch('menu-items/{menu_item}/availability', [MenuItemController::class, 'updateAvailability']);

        Route::get('orders', [ShopOrderController::class, 'index']);
        Route::get('orders/{order}', [ShopOrderController::class, 'show']);
        Route::patch('orders/{order}/accept', [ShopOrderController::class, 'accept']);
        Route::patch('orders/{order}/reject', [ShopOrderController::class, 'reject']);
        Route::patch('orders/{order}/release', [ShopOrderController::class, 'release']);
    });

    Route::get('orders/available', [OrderController::class, 'available']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
    Route::post('orders/shop', [OrderController::class, 'storeShopOrder']);
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::patch('orders/{order}/payment', [OrderController::class, 'updatePayment']);
    Route::patch('orders/{order}/location', [OrderController::class, 'updateLocation']);
    Route::patch('orders/{order}/assign', [OrderController::class, 'assign']);
    Route::patch('orders/{order}/claim', [OrderController::class, 'claim']);
    Route::patch('orders/{order}/complete', [OrderController::class, 'complete']);
});
