package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.user.UserResponseDTO;
import com.mme.travelassist.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Converts a User entity to a UserResponseDTO.
     *
     * @param user the User entity to convert
     * @return the converted UserResponseDTO
     */
    UserResponseDTO userToUserResponseDTO(User user);

}
