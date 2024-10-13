// src/category/CategoryAdminMain.js
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './CategoryAdminMain.css';
//
// const CategoryAdminMain = () => {
//     const [categories, setCategories] = useState([]);
//     const navigate = useNavigate();
//     const token = 'YOUR_ACCESS_TOKEN'; // 실제 인증 토큰으로 교체하세요.
//
//     // 카테고리 목록 조회
//     const fetchCategories = async () => {
//         try {
//             const response = await fetch('http://localhost:8080/api/categories', {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 },
//             });
//
//             if (!response.ok) {
//                 if (response.status === 401) {
//                     alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//                 }
//                 throw new Error('네트워크 응답이 정상적이지 않습니다.');
//             }
//
//             const data = await response.json();
//             setCategories(data);
//         } catch (error) {
//             console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
//         }
//     };
//
// // 컴포넌트가 마운트될 때 카테고리 목록을 가져오기 위해 useEffect 안에서 호출합니다.
//     useEffect(() => {
//         fetchCategories();
//     }, []);
//
//
//
//     // 카테고리 생성 버튼 핸들러
//     const handleCreateCategory = () => {
//         navigate('/category-create');
//     };
//
//     // 카테고리 수정 버튼 핸들러
//     const handleUpdateCategory = (categoryId) => {
//         navigate(`/category-update/${categoryId}`);
//     };
//
//     return (
//         <div className="category-admin-container">
//             <h1>카테고리 관리자 메인 페이지</h1>
//             <button className="create-button" onClick={handleCreateCategory}>카테고리 생성</button>
//             <ul className="category-list">
//                 {categories.map(category => (
//                     <li className="category-item" key={category.id}>
//                         {category.name}
//                         <button onClick={() => handleUpdateCategory(category.id)}>수정</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };
//
// export default CategoryAdminMain;


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './CategoryAdminMain.css';
//
// const CategoryAdminMain = () => {
//     const [categories, setCategories] = useState([]);
//     const navigate = useNavigate();
//
//     // 카테고리 목록 조회
//     const fetchCategories = async () => {
//         try {
//             const response = await axios.get('http://localhost:8080/api/categories', {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 },
//             });
//             setCategories(response.data);
//         } catch (error) {
//             console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
//             if (error.response && error.response.status === 401) {
//                 alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//             }
//         }
//     };
//
//     // 카테고리 삭제 함수
//     const deleteCategory = async (categoryId) => {
//         const confirmDelete = window.confirm("이 카테고리를 삭제하시겠습니까?");
//         if (!confirmDelete) return;
//
//         try {
//             await axios.delete(`http://localhost:8080/api/admin/categories/${categoryId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });
//             setCategories(categories.filter(category => category.id !== categoryId)); // 삭제 후 상태 업데이트
//             alert("카테고리가 삭제되었습니다.");
//         } catch (error) {
//             console.error('카테고리 삭제 중 오류가 발생했습니다.', error);
//             if (error.response && error.response.status === 401) {
//                 alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//             }
//         }
//     };
//
//     // 카테고리 생성 버튼 핸들러
//     const handleCreateCategory = () => {
//         navigate('/category-create');
//     };
//
//     // 카테고리 수정 버튼 핸들러
//     const handleUpdateCategory = (categoryId) => {
//         navigate(`/category-update/${categoryId}`);
//     };
//
//     // 컴포넌트가 마운트될 때 카테고리 목록을 가져오기 위해 useEffect 안에서 호출합니다.
//     useEffect(() => {
//         fetchCategories();
//     }, []);
//
//     return (
//         <div className="category-admin-container">
//             <h1>카테고리 관리자 메인 페이지</h1>
//             <button className="create-button" onClick={handleCreateCategory}>카테고리 생성</button>
//             <ul className="category-list">
//                 {categories.map(category => (
//                     <li className="category-item" key={category.id}>
//                         {category.name}
//                         <button onClick={() => handleUpdateCategory(category.id)}>수정</button>
//                         <button onClick={() => deleteCategory(category.id)} className="delete-button">삭제</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };
//
// export default CategoryAdminMain;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CategoryAdminMain.css';

const CategoryAdminMain = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지를 추적하는 상태 변수 추가
    const [categoriesPerPage] = useState(5); // 페이지당 카테고리 개수를 설정 (고정값으로 5개 설정)
    const navigate = useNavigate();

    // 카테고리 목록 조회
    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            setCategories(response.data);
        } catch (error) {
            console.error('카테고리 목록을 가져오는 데 실패했습니다.', error);
            if (error.response && error.response.status === 401) {
                alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
            }
        }
    };

    // 카테고리 삭제 함수
    const deleteCategory = async (categoryId) => {
        const confirmDelete = window.confirm("이 카테고리를 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8080/api/admin/categories/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCategories(categories.filter(category => category.id !== categoryId)); // 삭제 후 상태 업데이트
            alert("카테고리가 삭제되었습니다.");
        } catch (error) {
            console.error('카테고리 삭제 중 오류가 발생했습니다.', error);
            if (error.response && error.response.status === 401) {
                alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
            }
        }
    };

    // 카테고리 생성 버튼 핸들러
    const handleCreateCategory = () => {
        navigate('/category-create');
    };

    // 카테고리 수정 버튼 핸들러
    const handleUpdateCategory = (categoryId) => {
        navigate(`/category-update/${categoryId}`);
    };

    // 페이지 변경 함수 추가
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 컴포넌트가 마운트될 때 카테고리 목록을 가져오기 위해 useEffect 안에서 호출합니다.
    useEffect(() => {
        fetchCategories();
    }, []);

    // 페이지네이션을 위한 현재 페이지에 해당하는 카테고리 데이터 계산
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(categories.length / categoriesPerPage);

    return (
        <div className="category-admin-container">
            <h1>카테고리 관리자 메인 페이지</h1>
            <button className="create-button" onClick={handleCreateCategory}>카테고리 생성</button>
            <ul className="category-list">
                {currentCategories.map(category => (
                    <li className="category-item" key={category.id}>
                        {category.name}
                        <button onClick={() => handleUpdateCategory(category.id)}>수정</button>
                        <button onClick={() => deleteCategory(category.id)} className="delete-button">삭제</button>
                    </li>
                ))}
            </ul>

            {/* 페이지네이션 버튼 렌더링 */}
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    이전
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default CategoryAdminMain;