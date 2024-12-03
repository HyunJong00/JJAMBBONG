import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Logo } from "../assets/logo.svg";
import cameraIcon from "../assets/icon_camera.png";
import iconEdit from "../assets/icon_edit.png"; // 닉네임 변경 아이콘
import iconNoItinerary from "../assets/icon_noItinerary.png"; // 일정 생성 아직 안 했을 때
import styles from "./MyPage.module.css";
import InputModal from "../components/InputModal";
import SearchBar from "../components/SearchBar";
import MyItinerary from "../components/MyItinerary";
import { loadTravelPlans } from "../api/savePlanApi";

function MyPage() {
  const handleLogout = () => {
    // localStorage 데이터 삭제
    localStorage.clear();
    // 로그아웃 후 페이지 이동
    window.location.href = "/";
  };

  const navigate = useNavigate();

  // 사용자 정보 상태
  const iconUserProfile = "/icon_userprofile.png";
  const [profileImage, setProfileImage] = useState(iconUserProfile);
  const [nickname, setNickname] = useState("닉네임 없음");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);

  // SearchBar
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("latest");

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");

    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setProfileImage(userInfo.profileImage || iconUserProfile);
      setNickname(userInfo.nickname || "닉네임 없음");
      //setUserId(userInfo.id || "default_user_id");
    }

    // 여행 계획 불러오기 API 호출
    const fetchItineraries = async () => {
      try {
        const userId = "default_user_id"; // TODO: 로그인 성공하면 id도 로컬스토리지에서 (userInfo.id)
        const response = await loadTravelPlans(userId);
        if (response?.plans) {
          const formattedPlans = response.plans.map((plan, index) => ({
            id: index, // 임시 ID 생성
            title: plan.travel_name,
            tags: plan.hashtag,
            date: "생성 날짜 필요", //TODO: 프론트에서 하기
          }));
          setItineraries(formattedPlans);
        }
      } catch (error) {
        console.error("일정 불러오기 실패:", error);
      }
    };

    fetchItineraries();
  }, []);

  // 일정 필터링
  useEffect(() => {
    let filteredData = [...itineraries];

    // 검색어로 필터링
    if (searchTerm) {
      filteredData = filteredData.filter(
        (itinerary) =>
          itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          itinerary.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 드롭다운으로 필터링
    if (selectedFilter === "latest") {
      filteredData.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬
    } else if (selectedFilter === "oldest") {
      filteredData.sort((a, b) => new Date(a.date) - new Date(b.date)); // 오래된 순 정렬
    }

    setFilteredItineraries(filteredData);
  }, [searchTerm, selectedFilter, itineraries]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      // 프로필 이미지 업데이트를 localStorage에 반영
      const updatedUserInfo = {
        nickname,
        profileImage: imageUrl,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
    }
  };

  const handleClickProfileImage = () => {
    document.getElementById("profileImageInput").click();
  };

  const handleEditNickname = () => {
    setIsNicknameModalOpen(true);
  };

  const handleSaveNickname = (newNickname) => {
    setNickname(newNickname);
    setIsNicknameModalOpen(false);

    // 닉네임 업데이트를 localStorage에 반영
    const updatedUserInfo = {
      nickname: newNickname,
      profileImage,
    };
    localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
  };

  const handleMeetTamtamClick = () => {
    navigate("/");
  };

  return (
    <div className={styles.myPage}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <h2 className={styles.logotitle}>탐라, 탐나</h2>
          <Logo className={styles.logo} />
        </div>
        <div className={styles.headerLinks}>
          <span className={styles.link} onClick={() => navigate("/")}>
            메인 페이지
          </span>
          <span>|</span>
          <span className={styles.link} onClick={handleLogout}>
            로그아웃
          </span>
        </div>
      </div>
      <div className={styles.profileContainer}>
        <div
          className={styles.profileImageWrapper}
          onClick={handleClickProfileImage}
        >
          <img
            src={profileImage || iconUserProfile}
            alt="Profile"
            className={styles.profileImage}
            onError={(e) => {
              e.target.src = iconUserProfile; // 로드 실패 시 기본 이미지로 대체
            }}
          />
          <img
            src={cameraIcon}
            alt="Change Profile"
            className={styles.cameraIcon}
          />
          <input
            type="file"
            id="profileImageInput"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        </div>
        <div className={styles.nicknameContainer}>
          <div className={styles.nickname}>{nickname}</div>
          <img
            src={iconEdit}
            alt="Edit Nickname"
            className={styles.editNicknameIcon}
            onClick={handleEditNickname}
          />
        </div>
      </div>
      <div className={styles.separator} />
      <div className={styles.memorySection}>
        <div className={styles.memoryHeader}>
          <span className={styles.memoryTitle}>나의 일정 목록</span>
        </div>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          placeholder="태그나 제목으로 검색해 주세요"
        />
      </div>

      {/* 일정 목록 렌더링 */}
      {filteredItineraries.length > 0 ? (
        <div className={styles.itineraryList}>
          {filteredItineraries.map((itinerary) => (
            <MyItinerary key={itinerary.id} itinerary={itinerary} />
            // <MyItinerary
            //   key={itinerary.id}
            //   itinerary={itinerary}
            //   userId={userId}
            // />
          ))}
        </div>
      ) : (
        <div className={styles.noItineraries}>
          <img
            src={iconNoItinerary}
            alt="No itineraries"
            className={styles.noItineraryImage}
          />
          <button
            className={styles.meetTamtamButton}
            onClick={handleMeetTamtamClick}
          >
            탐탐이 만나러 가기
          </button>
        </div>
      )}

      {/* 닉네임 변경 모달 */}
      {isNicknameModalOpen && (
        <InputModal
          title="닉네임 변경"
          description="변경할 닉네임을 입력해주세요."
          onClose={() => setIsNicknameModalOpen(false)}
          onConfirm={handleSaveNickname}
        />
      )}
    </div>
  );
}

export default MyPage;