import React from 'react';
import { useState, useEffect } from 'react';
import { hotelsService } from '../api/axiosInstance';
import { Hotel, UserDataType } from '../interfaces/types';
import { getExceptedHotelsQueryString } from '../utils/getQueryString';

export default function useHotels() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const userHotels = Object.values(window.localStorage)
    .map((value) => JSON.parse(value))
    .filter(
      (value) =>
        Object.keys(value).includes('hotelName') &&
        Object.keys(value).includes('checkInDate') &&
        Object.keys(value).includes('checkOutDate') &&
        Object.keys(value).includes('numberOfGuests'),
    );

  async function getAllByPage(page: number = 1) {
    
    setTimeout(async () => {
      const data = await hotelsService.get(`?_page=${page}`);
      page === 1 ? setHotels(data) : setHotels([...hotels, ...data]);
      setIsLoading(false);
    }, 500);
  }

  async function getResultsByPage(searchParameter: UserDataType, page: number = 1) {
    setIsLoading(true);
    const searchString = searchParameter.hotelName?.split(' ').join('+') || '';
    const neQueryString = getExceptedHotelsQueryString(
      searchParameter.checkInDate,
      searchParameter.checkOutDate,
      userHotels,
    );
    setTimeout(async () => {
      const data = await hotelsService.get(
        `?occupancy.max_gte=${searchParameter.numberOfGuests}&q=${searchString}${neQueryString}&_page=${page}`,
      );
      page === 1 ? setHotels(data) : setHotels([...hotels, ...data]);
      setIsLoading(false);
    }, 500);
  }

  useEffect(() => {
    getAllByPage();
  }, []);

  return { isLoading, hotels, userHotels, getAllByPage, getResultsByPage };
}
