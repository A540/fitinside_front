import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {getCart, removeFromCart, clearCart, fetchProduct, useCartCount, updateCartQuantity} from './cartStorage';
import AvailableCouponModal from '../coupon/AvailableCouponModal';
import './cart.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";


const Cart = () => {
    const [cart, setCart] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [currentProductCoupons, setCurrentProductCoupons] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [appliedCoupons, setAppliedCoupons] = useState([]); // 여러 쿠폰 상태 추가

    useEffect(() => {
        setCart(getCart());
    }, []);

    useEffect(() => {
        const fetchAllProducts = async () => {
            const details = {};
            for (const item of cart) {
                const productData = await fetchProduct(item.id);
                if (productData) {
                    details[item.id] = productData;
                }
            }
            setProductDetails(details);
        };

        if (cart.length > 0) {
            fetchAllProducts();
        }
    }, [cart]);

    const handleRemoveFromCart = (id) => {
        // 장바구니에서 상품 제거
        removeFromCart(id);
        setCart(getCart());

        // 선택된 아이템에서 제거
        selectedItems.delete(id);
        setSelectedItems(new Set(selectedItems));

        // 해당 상품에 적용된 쿠폰 제거
        setAppliedCoupons(prevCoupons => prevCoupons.filter(c => c.productId !== id));
    };


    const handleClearCart = () => {
        clearCart();
        setCart([]);
        setProductDetails({});
        setSelectedItems(new Set());
        setTotalDiscount(0);
        setAppliedCoupons([]); // 전체 삭제 시 적용된 쿠폰 초기화
    };

    const handleSelectAll = () => {
        if (selectedItems.size === cart.length) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(cart.map(item => item.id));
            setSelectedItems(allIds);
        }
    };

    const handleRemoveSelected = () => {
        selectedItems.forEach(id => {
            removeFromCart(id);
        });
        setCart(getCart());
        setSelectedItems(new Set());
    };

    const handleQuantityChange = async (id, newQuantity) => {
        const updatedSuccessfully = await updateCartQuantity(id, newQuantity);
        if (updatedSuccessfully) {
            // 수량이 성공적으로 업데이트된 경우에만 장바구니 상태를 업데이트
            setCart(getCart());
        }
    };


    const cartCount = useCartCount();

    const fetchAvailableCoupons = async (productId) => {

        try {
            const response = await fetch(`http://localhost:8080/api/coupons/${productId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('적용 가능 쿠폰 목록을 가져오는 데 실패했습니다.');
            }

            const data = await response.json();
            setCurrentProductCoupons(data.coupons);
        } catch (error) {
            console.error(error.message);
            await sendRefreshTokenAndStoreAccessToken();
            window.location.reload();
        }
    };

    const handleShowCouponModal = (item) => {
        fetchAvailableCoupons(item.id);
        setCurrentProduct(item);
        setShowCouponModal(true);
    };

    const handleCloseCouponModal = () => {
        setShowCouponModal(false);
        setCurrentProduct(null);
    };

    useEffect(() => {
        console.log('현재 totalDiscount:', totalDiscount);
    }, [totalDiscount]);

    const handleApplyCoupon = (coupon) => {
        const currentPrice = productDetails[currentProduct.id]?.price || 0; // 현재 상품 가격
        const discountAmount = coupon.type === 'AMOUNT' ? coupon.value : (currentPrice * coupon.percentage) / 100; // 현재 쿠폰 할인 금액

        // 동일한 쿠폰이 다른 상품에 적용되어 있는지 확인
        const duplicateCoupon = appliedCoupons.find(c => c.couponMemberId === coupon.couponMemberId && c.productId !== currentProduct.id);

        let updatedCoupons = [...appliedCoupons]; // 기존 쿠폰 복사

        // 동일한 쿠폰이 다른 상품에 적용되어 있다면, 해당 쿠폰을 제거
        if (duplicateCoupon) {
            updatedCoupons = updatedCoupons.filter(c => c.couponMemberId !== coupon.couponMemberId);
            alert(`쿠폰 ${duplicateCoupon.name}이 다른 상품에 적용되어 있어 제거되었습니다.`);
        }

        // 현재 상품에 이미 적용된 쿠폰이 있는지 확인
        const existingCoupon = updatedCoupons.find(c => c.productId === currentProduct.id);

        // 기존 쿠폰이 있으면 제거
        if (existingCoupon) {
            updatedCoupons = updatedCoupons.filter(c => c.productId !== currentProduct.id);
            alert(`쿠폰 ${existingCoupon.name}이 현재 상품에 적용되어 있어 제거되었습니다.`);
        }

        // 현재 적용된 쿠폰 업데이트
        updatedCoupons.push({...coupon, productId: currentProduct.id}); // 새로운 쿠폰 추가
        setAppliedCoupons(updatedCoupons); // 상태 업데이트

        // 총 할인 금액 재계산
        const newTotalDiscount = updatedCoupons.reduce((total, c) => {
            const price = productDetails[c.productId]?.price || 0;
            const discount = c.type === 'AMOUNT' ? c.value : (price * c.percentage) / 100;
            return total + discount;
        }, 0);

        setTotalDiscount(newTotalDiscount); // 재계산된 할인 금액 설정

        console.log(`쿠폰 ${coupon.name}이 상품 ${currentProduct.id}에 적용되었습니다. 할인 금액: ${discountAmount}`);
        console.log('적용된 쿠폰들 ', updatedCoupons);
        handleCloseCouponModal();
    };


    const getTotalPrice = () => {
        const subtotal = cart.reduce((total, item) => {
            const price = productDetails[item.id]?.price || 0;
            return total + price * item.quantity;
        }, 0);

        return subtotal - totalDiscount ; // 할인 적용 후 최종 금액
    };

    // 주문하기 버튼 클릭 시 쿠폰 사용 정보 (주문 정보)를 로컬 스토리지에 저장
    const handleOrder = () => {
        const orderData = cart.map(item => {
            const productDetail = productDetails[item.id]; // 상품 세부 정보 가져오기
            const appliedCoupon = appliedCoupons.find(coupon => coupon.productId === item.id); // 해당 상품에 적용된 쿠폰 찾기

            // 할인 금액 계산
            const itemPrice = productDetail.price;  // 상품 기존 1개 값
            const discountAmount = appliedCoupon ? (appliedCoupon.type === 'AMOUNT' ? appliedCoupon.value : (itemPrice * appliedCoupon.percentage) / 100) : 0;
            const originalTotalPrice = itemPrice * item.quantity;
            const discountedTotalPrice = originalTotalPrice - discountAmount;

            return {
                productId: item.id,
                productName: productDetail.productName, // 상품 이름
                quantity: item.quantity, // 수량
                itemPrice, // 상품 1개 가격
                originalTotalPrice, // 원래 총 가격
                discountedTotalPrice, // 할인된 총 가격
                couponName: appliedCoupon ? appliedCoupon.name : null, // 적용된 쿠폰 이름
                couponMemberId: appliedCoupon ? appliedCoupon.couponMemberId : null, // 적용된 쿠폰 ID
            };
        });

        // 로컬 스토리지에 저장
        localStorage.setItem('orderData', JSON.stringify(orderData));
        localStorage.setItem('shippingCost', JSON.stringify(shippingCost));
    };

    const calculateShippingCost = () => {
        const totalPrice = getTotalPrice() + totalDiscount;
        if (cartCount === 0) {
            return 0;
        }
        return totalPrice < 20000 ? 2500 : 0;
    };

    const shippingCost = calculateShippingCost(); // 배송비 변수로 관리

    return (
        <div className="cart-container">
            <h2>쇼핑백</h2>
            <br/>
            <div className="both-container">
                <div className="left-container">
                    <div className="d-flex justify-content-between">
                        <div>
                            <button className="btn btn-light text-dark me-2" style={{border: '1px solid #ced4da'}}
                                    onClick={handleSelectAll}>
                                {selectedItems.size === cart.length ? '전체선택 해제' : '전체선택'}
                            </button>
                            <button className="btn btn-light text-dark me-2" style={{border: '1px solid #ced4da'}}
                                    onClick={handleRemoveSelected} disabled={selectedItems.size === 0}>
                                선택삭제
                            </button>
                            <button className="btn btn-danger" style={{border: '1px solid #dc3545'}}
                                    onClick={handleClearCart}>
                                전체삭제
                            </button>
                        </div>
                    </div>
                    <hr/>

                    {cart.length === 0 ? (
                        <p className="no-content">장바구니에 상품이 없습니다.</p>
                    ) : (
                        <table className="table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>상품정보</th>
                                <th>상품금액</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => {
                                                const newSelectedItems = new Set(selectedItems);
                                                if (newSelectedItems.has(item.id)) {
                                                    newSelectedItems.delete(item.id);
                                                } else {
                                                    newSelectedItems.add(item.id);
                                                }
                                                setSelectedItems(newSelectedItems);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        {productDetails[item.id] ? (
                                            <div>
                                                <p style={{margin: `0`}}>{productDetails[item.id].manufacturer}</p>
                                                <p style={{fontWeight: 'bold'}}>
                                                    <Link to={`/product/${item.id}`}
                                                          style={{textDecoration: 'none', color: 'inherit'}}>
                                                        {productDetails[item.id].productName}
                                                    </Link>
                                                </p>
                                                <label className="d-flex align-items-center">
                                                    수량
                                                    <select
                                                        className="form-select ms-2"
                                                        style={{width: 'auto'}}
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                                    >
                                                        {/* 1부터 20까지의 수량 선택 */}
                                                        {[...Array(20)].map((_, index) => (
                                                            <option key={index + 1} value={index + 1}>
                                                                {index + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                {/* 현재 적용된 쿠폰 및 할인 금액 표시 */}
                                                {appliedCoupons.filter(coupon => coupon.productId === item.id).map((coupon, index) => {
                                                    const discountAmount = coupon.type === 'AMOUNT' ? coupon.value : (productDetails[item.id].price * coupon.percentage) / 100;
                                                    return (
                                                        <p key={index} style={{margin: '0', color: '#629a72'}}>
                                                            적용된 쿠폰: {coupon.name} (-{discountAmount.toLocaleString()} 원)
                                                        </p>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p>상품 정보를 불러올 수 없습니다...</p>
                                        )}
                                    </td>
                                    <td>
                                        {productDetails[item.id] ? (
                                            <div>
                                                <p>
                                                    {(productDetails[item.id].price * item.quantity).toLocaleString()} 원
                                                </p>
                                                <button className="btn btn-light text-dark me-2"
                                                        style={{border: '1px solid #ced4da'}}
                                                        onClick={() => handleShowCouponModal(item)}>적용 가능 쿠폰
                                                </button>
                                            </div>
                                        ) : (
                                            <p>상품 정보를 불러올 수 없습니다...</p>
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-light text-dark me-2"
                                                style={{border: '1px solid #ced4da'}}
                                                onClick={() => handleRemoveFromCart(item.id)}>
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="right-container">
                    <div className="order-container">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <p>상품 금액 ({cartCount})</p>
                            {totalDiscount > 0 ? (
                                <span>
            <p style={{textDecoration: 'line-through', marginRight: '8px'}}>
                {(getTotalPrice() + totalDiscount).toLocaleString()} 원
            </p>
            <p style={{color: '#B22222'}}>
                {getTotalPrice().toLocaleString()} 원
            </p>
        </span>
                            ) : (
                                <p>{getTotalPrice().toLocaleString()} 원</p> // 할인 금액이 0원일 경우
                            )}

                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>

                            <p>배송비</p>
                            {cartCount === 0 ? (
                                <p>0 원</p>
                            ) : shippingCost > 0 ? (
                                <p>{shippingCost.toLocaleString()} 원</p>
                            ) : (
                                <span>
                <p style={{textDecoration: 'line-through'}}>2,500 원</p>
                <p style={{marginLeft: '8px'}}>무료</p>
            </span>
                            )}
                        </div>
                        <hr/>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <strong>결제예정금액</strong>
                            {cartCount === 0 ? (
                                <strong style={{color: '#B22222'}}>0 원</strong>
                            ) : (
                                <strong style={{color: '#B22222'}}>{(getTotalPrice()+shippingCost).toLocaleString()} 원</strong>
                            )}
                        </div>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <div className="discount-container">
                                <strong>{totalDiscount.toLocaleString()} 원</strong>
                                <strong style={{color: '#B22222'}}>
                                    {getTotalPrice() > 0 ? `(${Math.floor((totalDiscount / (getTotalPrice()+totalDiscount)) * 100)}%)` : '(0%)'}
                                </strong>
                                &nbsp;<p style={{margin: 0}}>할인 받았어요!</p>
                            </div>

                        </div>
                        {/* 적용된 쿠폰 정보 출력 */}
                        {appliedCoupons.length > 0 && (
                            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
                                <div className="applied-coupon-container">
                                    <strong>적용된 쿠폰</strong>
                                    {appliedCoupons.map((coupon, index) => (
                                        <p key={index} style={{color: '#629a72', margin: 0}}>
                                            {coupon.name} {coupon.type === 'AMOUNT' ? `(-${coupon.value.toLocaleString()} 원)` : `(${coupon.percentage}% 할인)`}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>


                    <div style={{display: 'flex', justifyContent: 'center', margin: `10px 0`}}>
                        <a className="btn btn-light text-dark me-2 p-3" style={{border: '1px solid #ced4da'}}
                           href="/">계속
                            쇼핑하기</a>
                        <a
                            className="btn btn-custom p-3"
                            onClick={handleOrder}
                            href={cartCount > 0 ? "/order" : "/cart"} // cartCount가 0일 때 링크를 비활성화
                            style={{
                                pointerEvents: cartCount === 0 ? 'none' : 'auto',
                                opacity: cartCount === 0 ? 0.5 : 1
                            }} // 비활성화 스타일
                        >
                            전체 주문하기
                        </a>

                    </div>
                </div>
            </div>

            {/* 쿠폰 모달 */
            }
            {
                showCouponModal && currentProduct && (
                    <AvailableCouponModal
                        coupons={currentProductCoupons}
                        onClose={handleCloseCouponModal}
                        onApplyCoupon={handleApplyCoupon}
                    />
                )
            }
        </div>
    )
        ;
};

export default Cart;

