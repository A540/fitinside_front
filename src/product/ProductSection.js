import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addToCart } from '../cart/cartStorage';

const ProductSection = () => {
    const { id: productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/products/${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                    setSelectedImage(data.productImgUrls ? data.productImgUrls[0] : '');
                } else {
                    console.error("Failed to fetch product data");
                }
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = async () => {
        if (product) {
            const cartItem = {
                id: product.id,
                quantity,
                color: selectedColor,
                size: selectedSize,
            };

            const result = await addToCart(cartItem);
            if (result) {
                alert(`${product.productName}이(가) 장바구니에 추가되었습니다.`);
            }

            const moveToCart = window.confirm('장바구니로 이동하시겠습니까?');
            if (moveToCart) {
                navigate('/cart');
            }
        }
    };

    const handleImageClick = (imgUrl) => {
        setSelectedImage(imgUrl);
    };

    if (!product) {
        return <p>Loading...</p>;
    }

    const productImages = product.productImgUrls && product.productImgUrls.length > 0
        ? product.productImgUrls
        : ['https://dummyimage.com/450x300/dee2e6/6c757d.jpg'];

    return (
        <section className="py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-center">
                    {/* 이미지 갤러리 섹션 */}
                    <div className="col-md-6">
                        <div
                            id="productCarousel"
                            className="carousel slide"
                            data-bs-ride="carousel"
                            style={{ width: '100%', height: '400px', overflow: 'hidden' }}
                        >
                            <div className="carousel-inner" style={{ width: '100%', height: '100%' }}>
                                {productImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <img
                                            className="d-block w-100 h-100"
                                            src={image}
                                            alt={`Product image ${index + 1}`}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* 슬라이드 이전 버튼 */}
                            <button className="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            {/* 슬라이드 다음 버튼 */}
                            <button className="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                    {/* 제품 정보 섹션 */}
                    <div className="col-md-6">
                        <h1 className="display-5 fw-bolder">{product.productName}</h1>
                        <div className="fs-5 mb-5">
                            <span>{product.price.toLocaleString()}원</span>
                        </div>
                        {/* 색상 선택 섹션 */}
                        <div className="mb-3">
                            <label className="form-label">색상</label>
                            <select
                                className="form-select"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                            >
                                <option value="">색상을 선택하세요</option>
                                {product.colors && product.colors.map((color, index) => (
                                    <option key={index} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                        {/* 사이즈 선택 섹션 */}
                        <div className="mb-3">
                            <label className="form-label">사이즈</label>
                            <select
                                className="form-select"
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                            >
                                <option value="">사이즈를 선택하세요</option>
                                {product.sizes && product.sizes.map((size, index) => (
                                    <option key={index} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        {/* 수량 입력 및 장바구니 버튼 */}
                        <div className="d-flex mb-3">
                            <input
                                className="form-control text-center me-3"
                                id="inputQuantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                style={{ maxWidth: '3rem' }}
                            />
                            <button className="btn btn-dark flex-shrink-0" type="button" onClick={handleAddToCart}>
                                장바구니 담기
                            </button>
                        </div>
                    </div>
                </div>
                {/* 탭 구성 섹션 */}
                <div className="mt-5">
                    <ul className="nav nav-tabs" id="productDetailsTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab" aria-controls="info" aria-selected="true">
                                상품 정보
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link" id="qna-tab" data-bs-toggle="tab" data-bs-target="#qna" type="button" role="tab" aria-controls="qna" aria-selected="false">
                                상품 Q&A
                            </button>
                        </li>
                    </ul>
                    <div className="tab-content" id="productDetailsTabsContent">
                        <div className="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
                            <p>{product.info}</p>
                        </div>
                        <div className="tab-pane fade" id="qna" role="tabpanel" aria-labelledby="qna-tab">
                            <p>여기에서 상품에 대한 Q&A를 볼 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductSection;