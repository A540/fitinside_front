import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductCreate = () => {
    const [formData, setFormData] = useState({
        categoryName: '',
        productName: '',
        price: '',
        info: '',
        manufacturer: '',
        stock: '',
        productImgUrls: [],
        productDescImgUrls: [] // 상품 설명 이미지 추가
    });

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [descImages, setDescImages] = useState([]); // 설명 이미지 상태 추가
    const [previewImages, setPreviewImages] = useState([]);
    const [previewDescImages, setPreviewDescImages] = useState([]); // 설명 이미지 미리보기 상태 추가
    const [productNameError, setProductNameError] = useState('');
    const [infoError, setInfoError] = useState('');
    const [manufacturerError, setManufacturerError] = useState('');
    const navigate = useNavigate();

    // 카테고리 목록을 서버에서 가져오는 useEffect
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/categories');
                const filteredCategories = response.data.filter(category => category.parentId !== null);
                setCategories(filteredCategories);
            } catch (error) {
                console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 상품명 글자 수 제한 (최대 100자)
        if (name === 'productName' && value.length > 100) {
            setProductNameError('상품명은 최대 100자까지 입력할 수 있습니다.');
        } else {
            setProductNameError('');
        }

        // 상세 정보 글자 수 제한 (최대 500자)
        if (name === 'info' && value.length > 500) {
            setInfoError('상품 설명은 최대 500자까지 입력할 수 있습니다.');
        } else {
            setInfoError('');
        }

        // 제조사 글자 수 제한 (최대 100자)
        if (name === 'manufacturer' && value.length > 100) {
            setManufacturerError('제조사는 최대 100자까지 입력할 수 있습니다.');
        } else {
            setManufacturerError('');
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setImages(selectedFiles);

        // 미리보기 이미지 생성
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(previewUrls);
    };

    // 상품 설명 이미지 핸들러
    const handleDescImageChange = (e) => {
        const selectedDescFiles = Array.from(e.target.files);
        setDescImages(selectedDescFiles);

        // 미리보기 설명 이미지 생성
        const previewDescUrls = selectedDescFiles.map(file => URL.createObjectURL(file));
        setPreviewDescImages(previewDescUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (formData.productName.length > 100) {
            setProductNameError('상품명은 최대 100자까지 입력할 수 있습니다.');
            return;
        }
        if (formData.info.length > 500) {
            setInfoError('상품 설명은 최대 500자까지 입력할 수 있습니다.');
            return;
        }
        if (formData.manufacturer.length > 100) {
            setManufacturerError('제조사는 최대 100자까지 입력할 수 있습니다.');
            return;
        }

        const data = new FormData();
        data.append('categoryName', formData.categoryName);
        data.append('productName', formData.productName);
        data.append('price', formData.price);
        data.append('info', formData.info);
        data.append('manufacturer', formData.manufacturer);
        data.append('stock', formData.stock);

        // 상품 이미지를 FormData에 추가
        images.forEach((image) => {
            data.append('productImgUrls', image);
        });

        // 상품 설명 이미지를 FormData에 추가
        descImages.forEach((image) => {
            data.append('productDescImgUrls', image);
        });

        try {
            const response = await axios.post('http://localhost:8080/api/admin/products', data);
            if (response.status === 200) {
                console.log('상품이 성공적으로 등록되었습니다.');
                navigate('/admin/products');
            }
        } catch (error) {
            console.error('상품 등록에 실패했습니다.', error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="display-4 mb-4">상품 등록</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* 카테고리 선택 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">카테고리 선택</label>
                    <div className="col-sm-3">
                        <select
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">카테고리 선택</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품명</label>
                    <div className="col-sm-3">
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            className={`form-control ${productNameError ? "is-invalid" : ""}`}
                            required
                        />
                        {productNameError && <div className="invalid-feedback">{productNameError}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">가격</label>
                    <div className="col-sm-3">
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상세 정보</label>
                    <div className="col-sm-5">
                        <textarea
                            name="info"
                            value={formData.info}
                            onChange={handleChange}
                            rows="2"
                            className={`form-control ${infoError ? "is-invalid" : ""}`}
                            required
                        />
                        {infoError && <div className="invalid-feedback">{infoError}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">제조사</label>
                    <div className="col-sm-3">
                        <input
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            className={`form-control ${manufacturerError ? "is-invalid" : ""}`}
                        />
                        {manufacturerError && <div className="invalid-feedback">{manufacturerError}</div>}
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">재고 수</label>
                    <div className="col-sm-3">
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>
                {/* 상품 이미지 업로드 필드 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 이미지 업로드</label>
                    <div className="col-sm-3">
                        <input
                            type="file"
                            name="productImgUrls"
                            onChange={handleImageChange}
                            className="form-control"
                            multiple
                        />
                    </div>
                </div>

                {/* 상품 이미지 미리보기 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 이미지 미리보기</label>
                    <div className="col-sm-10">
                        <div className="row">
                            {previewImages.map((src, index) => (
                                <div key={index} className="col-md-3">
                                    <img
                                        src={src}
                                        alt={`미리보기 ${index + 1}`}
                                        className="img-thumbnail"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 상품 설명 이미지 업로드 필드 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 설명 이미지 업로드</label>
                    <div className="col-sm-3">
                        <input
                            type="file"
                            name="productDescImgUrls"
                            onChange={handleDescImageChange}
                            className="form-control"
                            multiple
                        />
                    </div>
                </div>

                {/* 상품 설명 이미지 미리보기 */}
                <div className="form-group row">
                    <label className="col-sm-2 col-form-label">상품 설명 이미지 미리보기</label>
                    <div className="col-sm-10">
                        <div className="row">
                            {previewDescImages.map((src, index) => (
                                <div key={index} className="col-md-3">
                                    <img
                                        src={src}
                                        alt={`설명 이미지 미리보기 ${index + 1}`}
                                        className="img-thumbnail"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-group row">
                    <div className="col-sm-10">
                        <button type="submit" className="btn btn-primary">등록</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;
