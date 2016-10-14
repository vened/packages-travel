<!DOCTYPE html>
<html ng-app="pay_form">
<head lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=100%; initial-scale=1; maximum-scale=1; minimum-scale=1; user-scalable=no;">
    <title>Pay Form</title>
    <link rel="stylesheet" href="css/base.css"/>
</head>
<body>

<div class="pay-form" ng-controller="PayFormCtrl">
    <div class="pay-form__title">
        Заказ №38569247
    </div>
    <form novalidate name="paymentForm">
        <div class="pay-form-fields">
            <div class="load load_error">
                Ошибка оплаты.
                <br/>
                Данный заказ находится в процессе обработки и не может быть оплачен повторно.
                <br>
                <br>
                <a href='#'>Вернуться без оплаты</a>
            </div>
        </div>
        <div class="pay-form-actions">

            <div class="pay-form__price">
                <div class="pay-form__price-label">Сумма к оплате</div>
                <div class="pay-form__price-value gray">170 920 <span class="ruble">c</span></div>
            </div>

            <div class="pay-form-actions__btn">
                <input
                        type="submit"
                        class="form-btn background-gray"
                        value="Оплатить"
                >
            </div>

        </div>
    </form>
</div>

<script src="js/libs.js"></script>
<script src="js/app.js"></script>
</body>
</html>