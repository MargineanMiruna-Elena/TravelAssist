package com.mme.travelassist.service.implementation;

import com.mme.travelassist.exception.auth.InvalidPasswordException;
import com.mme.travelassist.exception.user.DuplicateUserException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.User;
import com.mme.travelassist.model.UserPreferences;
import com.mme.travelassist.repository.UserPreferencesRepository;
import com.mme.travelassist.repository.UserRepository;
import com.mme.travelassist.service.MailService;
import com.mme.travelassist.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final MailService mailService;

    @Override
    public User getUserById(UUID id) throws UserNotFoundException {
        logger.info("UserService - Fetching user with ID: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", id);
            throw new UserNotFoundException();
        }
        return user.get();
    }

    @Override
    public UserPreferences getUserPreferencesByUserId(UUID id) throws UserNotFoundException {
        logger.info("UserService - Fetching user preferences with ID: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", id);
            throw new UserNotFoundException();
        }
        Optional<UserPreferences> userPreferences = userPreferencesRepository.findByUserId(id);
        if (userPreferences.isEmpty()) {
            logger.warn("User preferences with ID {} not found", id);
            return new UserPreferences();
        }
        return userPreferences.get();
    }

    @Override
    public User getUserByEmail(String email) throws UserNotFoundException {
        logger.info("UserService - Fetching user with email: {}", email);
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            logger.warn("User with email {} not found", email);
            throw new UserNotFoundException();
        }
        return user.get();
    }

    @Override
    public User patchUser(User user) throws UserNotFoundException, DuplicateUserException {
        UUID id = user.getId();
        logger.info("UserService - Attempting to patch user: {}", id);

        Optional<User> existingUserOpt = userRepository.findById(id);
        if (existingUserOpt.isEmpty()) {
            logger.warn("User with id {} not found for patch", id);
            throw new UserNotFoundException();
        }
        checkForDuplicateEmail(user.getEmail());
        User userToPatch = existingUserOpt.get();
        if(user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        patchUserFields(user, userToPatch);
        return userRepository.save(userToPatch);
    }

    @Override
    public UserPreferences patchUserPreferences(UserPreferences userPreferences) throws UserNotFoundException {
        UUID id = userPreferences.getUser().getId();
        logger.info("UserService - Attempting to patch user preferences: {}", id);

        Optional<UserPreferences> existingUserPreferencesOpt = userPreferencesRepository.findByUserId(id);
        if (existingUserPreferencesOpt.isEmpty()) {
            logger.warn("User preferences with id {} not found for patch", id);
            throw new UserNotFoundException();
        }

        UserPreferences userPreferencesToPatch = existingUserPreferencesOpt.get();

        patchUserPreferencesFields(userPreferences, userPreferencesToPatch);
        return userPreferencesRepository.save(userPreferencesToPatch);
    }

    @Override
    public void changePassword(UUID id, String oldPassword, String newPassword) throws UserNotFoundException, InvalidPasswordException, MessagingException {
        logger.info("UserService - Attempting to change user password: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", id);
            throw new UserNotFoundException();
        }
        if (!passwordEncoder.matches(oldPassword, user.get().getPassword())) {
            logger.warn("Old password does not match user password {}", oldPassword);
            throw new InvalidPasswordException();
        }

        user.get().setPassword(passwordEncoder.encode(newPassword));

        Optional<UserPreferences> userPreferences = userPreferencesRepository.findByUserId(id);
        if (userPreferences.isPresent() && userPreferences.get().getNotificationsEmail()) {
            mailService.sendChangedPasswordConfirmationEmail(user.get().getUsername(), user.get().getEmail(), userPreferences.get().getLanguage());
        }
        userRepository.save(user.get());
    }

    @Transactional
    @Override
    public void deleteUser(UUID id) throws UserNotFoundException {
        logger.info("UserService - Attempting to delete user with id: {}", id);
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found for deletion", id);
            throw new UserNotFoundException();
        }
        userRepository.deleteById(id);
    }

    /**
     * Checks if a user with the given email already exists in the repository.
     * @param email the email to check
     * @throws DuplicateUserException if a user with the same email already exists
     */
    private void checkForDuplicateEmail(String email) throws DuplicateUserException {
        if (userRepository.existsByEmail(email)) {
            logger.warn("User with email {} already exists", email);
            throw new DuplicateUserException();
        }
    }

    /**
     * Patches the target user with the values from the source user.
     * This method allows partial updates to a user.
     * It updates only the fields that are not null in the source user.
     *
     * @param source the source user containing new values
     * @param target the target user to be patched
     */
    private void patchUserFields(User source, User target) {
        if (source.getUsername() != null) target.setUsername(source.getUsername());
        if (source.getPassword() != null) target.setPassword(source.getPassword());
        if (source.getEmail() != null) target.setEmail(source.getEmail());
    }

    /**
     * Patches the target user preferences with the values from the source user preferences.
     * This method allows partial updates to a user's preferences.
     * It updates only the fields that are not null in the source user preferences.
     *
     * @param source the source user preferences containing new values
     * @param target the target user preferences to be patched
     */
    private void patchUserPreferencesFields(UserPreferences source, UserPreferences target) {
        if (source.getLanguage() != null) target.setLanguage(source.getLanguage());
        if (source.getNotificationsEmail() != null) target.setNotificationsEmail(source.getNotificationsEmail());
    }
}
