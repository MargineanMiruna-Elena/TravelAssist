package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.user.UserPreferencesDTO;
import com.mme.travelassist.dto.user.UserPreferencesResponseDTO;
import com.mme.travelassist.model.UserPreferences;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserPreferencesMapper {

    /**
     * Converts a UserPreferences to a UserPreferencesResponseDTO entity.
     *
     * @param userPreferences the UserPreferences to convert
     * @return the converted UserPreferencesResponseDTO
     */
    UserPreferencesResponseDTO userPreferencesToUserPreferencesResponseDTO(UserPreferences userPreferences);

    /**
     * Converts a UserPreferencesDTO to a UserPreferences entity.
     *
     * @param userPreferencesDTO the UserPreferencesDTO to convert
     * @return the converted UserPreferences
     */
    UserPreferences userPreferencesDTOToUserPreferences(UserPreferencesDTO userPreferencesDTO);
}
