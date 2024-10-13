import React, { useEffect, useState } from 'react';
import './coupon.css';
import CouponSearchModal from './CouponSearchModal';

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [includeInactiveCoupons, setIncludeInactiveCoupons] = useState(false);
    useEffect(() => {
        fetchCoupons(currentPage, includeInactiveCoupons);
        fetchCategories();
    }, [currentPage, includeInactiveCoupons]);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const handleOpenSearchModal = () => {
        setIsSearchModalOpen(true);
    };

    const handleCloseSearchModal = () => {
        setIsSearchModalOpen(false);
    };


    const fetchCoupons = async (page, includeInActiveCoupons) => {
        try {
            const response = await fetch(`http://localhost:8080/api/coupons?page=${page}&includeInActiveCoupons=${includeInActiveCoupons}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('네트워크 응답이 정상적이지 않습니다.');
            }

            const data = await response.json();
            setCoupons(data.coupons);
            setTotalPages(data.totalPages); // 총 페이지 수 설정
        } catch (error) {
            console.error('쿠폰 목록을 가져오는 데 실패했습니다.', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/categories', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('카테고리 목록을 가져오는 데 실패했습니다.');
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
        }
    };


    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleIncludeInactiveChange = (e) => {
        setIncludeInactiveCoupons(e.target.value === 'true');
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">내 쿠폰 목록</h2>
            <div className="d-flex flex-row justify-content-between">
                <button className="btn btn-light text-dark mb-4" style={{border: '1px solid #ced4da'}} onClick={handleOpenSearchModal}>쿠폰 검색</button>
                <CouponSearchModal isOpen={isSearchModalOpen} onRequestClose={handleCloseSearchModal}/>

                {/* 유효하지 않은 쿠폰 포함 드롭다운 */}
                <div className="mb-4">
                    <select
                        className="form-select"
                        value={includeInactiveCoupons ? 'true' : 'false'}
                        onChange={(e) => setIncludeInactiveCoupons(e.target.value === 'true')}
                    >
                        <option value="false">사용 가능한 쿠폰만 보기</option>
                        <option value="true">모든 쿠폰 보기</option>
                    </select>
                </div>
            </div>


            <div className="row">
                {coupons.map((coupon) => (
                    <div className="couponWrap" key={coupon.id}>
                        <div
                            className={`coupon couponLeft ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                            <h1 className="m-0 d-flex justify-content-between" style={{color: "white"}}>
                                {coupon.name}
                                <span>{coupon.active ? '사용가능' : '사용불가'}</span>
                            </h1>
                            <div className="title mt-4 mb-2">
                                <strong>{coupon.code}</strong>
                            </div>
                            <div className="name mb-0">
                                <strong>{coupon.categoryName}</strong>
                            </div>
                            <div className="name m-0">
                                ({coupon.type === 'AMOUNT' ? '고정 금액' : '퍼센티지'})&nbsp;
                                <strong>{coupon.type === 'AMOUNT' ? `${new Intl.NumberFormat().format(coupon.value)}원` : `${coupon.percentage}%`}</strong> 할인
                            </div>
                            <div className="name m-0">
                                {coupon.minValue === 0 ? '최소 주문 금액 없음' : new Intl.NumberFormat().format(coupon.minValue) + ' 원 부터 적용 가능'}
                            </div>
                            <div className="name m-0">
                                ~ {coupon.expiredAt} 까지 적용 가능
                            </div>
                        </div>

                        <div className={`coupon couponRight ${coupon.active ? (coupon.type === 'AMOUNT' ? 'red' : 'blue') : 'black'}`}>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이징 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', marginBottom: '50px' }}>
                <button className="btn btn-secondary me-2" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    이전
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button className="btn btn-secondary ms-2" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    다음
                </button>
            </div>

        </div>
    );
};

export default CouponList;